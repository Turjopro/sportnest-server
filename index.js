const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const verifyToken = require('./middleware/verifyToken');

const app = express();
const port = process.env.PORT || 5000;

// ------------------ Middleware ------------------
app.use(
  cors({
    origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// ------------------ MongoDB Setup ------------------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
};

async function run() {
  try {
    const db = client.db('sportNestDB');
    const facilitiesCollection = db.collection('facilities');
    const bookingsCollection = db.collection('bookings');

    // ------------------ Auth Related APIs ------------------

    // Issue JWT and store it in httpOnly cookie after Firebase login/register
    app.post('/jwt', (req, res) => {
      const user = req.body; // { email }
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, cookieOptions).send({ success: true });
    });

    // Clear the cookie on logout
    app.post('/logout', (req, res) => {
      res
        .clearCookie('token', { ...cookieOptions, maxAge: 0 })
        .send({ success: true });
    });

    // ------------------ Facilities APIs ------------------

    // Get all facilities - supports search (?search=) and filter (?type=)
    app.get('/facilities', async (req, res) => {
      const { search, type } = req.query;
      const query = {};

      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }
      if (type && type !== 'all') {
        query.facility_type = { $in: [type] };
      }

      const result = await facilitiesCollection.find(query).toArray();
      res.send(result);
    });

    // Get featured facilities for Home page (limit 6, e.g. latest added)
    app.get('/facilities/featured', async (req, res) => {
      const result = await facilitiesCollection
        .find()
        .sort({ _id: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    // Get facilities added by a specific logged in user (Manage My Facilities)
    app.get('/my-facilities', verifyToken, async (req, res) => {
      const email = req.query.email;
      if (req.user.email !== email) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      const result = await facilitiesCollection
        .find({ owner_email: email })
        .toArray();
      res.send(result);
    });

    // Get single facility by id
    app.get('/facilities/:id', async (req, res) => {
      const id = req.params.id;
      const result = await facilitiesCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // Add a new facility (private)
    app.post('/facilities', verifyToken, async (req, res) => {
      const facility = req.body;

      const requiredFields = [
        'name',
        'facility_type',
        'image',
        'location',
        'price_per_hour',
        'capacity',
      ];
      const missingField = requiredFields.find((field) => !facility[field]);
      if (missingField) {
        return res
          .status(400)
          .send({ message: `Missing required field: ${missingField}` });
      }

      facility.booking_count = 0;
      const result = await facilitiesCollection.insertOne(facility);
      res.send(result);
    });

    // Update a facility (private, owner only)
    app.patch('/facilities/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;

      const facility = await facilitiesCollection.findOne({
        _id: new ObjectId(id),
      });
      if (!facility) return res.status(404).send({ message: 'not found' });
      if (facility.owner_email !== req.user.email) {
        return res.status(403).send({ message: 'forbidden access' });
      }

      const result = await facilitiesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      res.send(result);
    });

    // Delete a facility (private, owner only)
    app.delete('/facilities/:id', verifyToken, async (req, res) => {
      const id = req.params.id;

      const facility = await facilitiesCollection.findOne({
        _id: new ObjectId(id),
      });
      if (!facility) return res.status(404).send({ message: 'not found' });
      if (facility.owner_email !== req.user.email) {
        return res.status(403).send({ message: 'forbidden access' });
      }

      const result = await facilitiesCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // ------------------ Bookings APIs ------------------

    // Create a booking (private)
    app.post('/bookings', verifyToken, async (req, res) => {
      const booking = req.body;

      const requiredFields = [
        'facility_id',
        'user_email',
        'booking_date',
        'time_slot',
        'hours',
        'total_price',
      ];
      const missingField = requiredFields.find((field) => !booking[field]);
      if (missingField) {
        return res
          .status(400)
          .send({ message: `Missing required field: ${missingField}` });
      }

      booking.status = 'pending';

      if (booking.user_email !== req.user.email) {
        return res.status(403).send({ message: 'forbidden access' });
      }

      const result = await bookingsCollection.insertOne(booking);

      // increase booking_count on the facility
      await facilitiesCollection.updateOne(
        { _id: new ObjectId(booking.facility_id) },
        { $inc: { booking_count: 1 } }
      );

      res.send(result);
    });

    // Get bookings for logged in user (private)
    app.get('/bookings', verifyToken, async (req, res) => {
      const email = req.query.email;
      if (req.user.email !== email) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      const result = await bookingsCollection
        .find({ user_email: email })
        .toArray();
      res.send(result);
    });

    // Cancel / delete a booking (private)
    app.delete('/bookings/:id', verifyToken, async (req, res) => {
      const id = req.params.id;

      const booking = await bookingsCollection.findOne({
        _id: new ObjectId(id),
      });
      if (!booking) return res.status(404).send({ message: 'not found' });
      if (booking.user_email !== req.user.email) {
        return res.status(403).send({ message: 'forbidden access' });
      }

      const result = await bookingsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    console.log('Connected to MongoDB and routes are ready!');
  } finally {
    // keep connection open while server runs
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('SportNest server is running');
});

app.listen(port, () => {
  console.log(`SportNest server listening on port ${port}`);
});