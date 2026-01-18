import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/User.js';
import { Group } from '../src/models/Group.js';
import { Expense } from '../src/models/Expense.js';

dotenv.config();

const sampleUsers = [
  {
    uid: 'demo_user_1',
    email: 'alex.johnson@example.com',
    name: 'Alex Johnson',
    phone: '+1234567890',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    emailVerified: true
  },
  {
    uid: 'demo_user_2',
    email: 'sarah.chen@example.com',
    name: 'Sarah Chen',
    phone: '+1234567891',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    emailVerified: true
  },
  {
    uid: 'demo_user_3',
    email: 'mike.brown@example.com',
    name: 'Mike Brown',
    phone: '+1234567892',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    emailVerified: true
  },
  {
    uid: 'demo_user_4',
    email: 'emma.wilson@example.com',
    name: 'Emma Wilson',
    phone: '+1234567893',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
    emailVerified: true
  },
  {
    uid: 'demo_user_5',
    email: 'james.lee@example.com',
    name: 'James Lee',
    phone: '+1234567894',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
    emailVerified: true
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spliteasy');
    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});
    await Group.deleteMany({});
    await Expense.deleteMany({});
    console.log('🧹 Cleared existing data');

    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`👥 Created ${createdUsers.length} users`);

    const goaGroup = await Group.create({
      name: 'Goa Trip 2024',
      description: 'Amazing beach vacation with friends',
      createdBy: createdUsers[0]._id,
      members: [
        {
          user: createdUsers[0]._id,
          name: createdUsers[0].name,
          email: createdUsers[0].email,
          phone: createdUsers[0].phone,
          photoURL: createdUsers[0].photoURL,
          joinedAt: new Date()
        },
        {
          user: createdUsers[1]._id,
          name: createdUsers[1].name,
          email: createdUsers[1].email,
          phone: createdUsers[1].phone,
          photoURL: createdUsers[1].photoURL,
          joinedAt: new Date()
        },
        {
          user: createdUsers[2]._id,
          name: createdUsers[2].name,
          email: createdUsers[2].email,
          phone: createdUsers[2].phone,
          photoURL: createdUsers[2].photoURL,
          joinedAt: new Date()
        },
        {
          user: createdUsers[3]._id,
          name: createdUsers[3].name,
          email: createdUsers[3].email,
          phone: createdUsers[3].phone,
          photoURL: createdUsers[3].photoURL,
          joinedAt: new Date()
        }
      ],
      currency: 'INR'
    });

    await Expense.create({
      description: 'Flight tickets to Goa',
      amount: 24000,
      paidBy: createdUsers[0]._id,
      group: goaGroup._id,
      splitType: 'equal',
      splitBetween: [
        { user: createdUsers[0]._id },
        { user: createdUsers[1]._id },
        { user: createdUsers[2]._id },
        { user: createdUsers[3]._id }
      ],
      category: 'transport',
      date: new Date('2024-01-15'),
      createdBy: createdUsers[0]._id
    });

    await Expense.create({
      description: 'Beach resort booking',
      amount: 18000,
      paidBy: createdUsers[1]._id,
      group: goaGroup._id,
      splitType: 'equal',
      splitBetween: [
        { user: createdUsers[0]._id },
        { user: createdUsers[1]._id },
        { user: createdUsers[2]._id },
        { user: createdUsers[3]._id }
      ],
      category: 'accommodation',
      date: new Date('2024-01-16'),
      createdBy: createdUsers[1]._id
    });

    await Expense.create({
      description: 'Beach dinner at Seafood Palace',
      amount: 4500,
      paidBy: createdUsers[2]._id,
      group: goaGroup._id,
      splitType: 'equal',
      splitBetween: [
        { user: createdUsers[0]._id },
        { user: createdUsers[1]._id },
        { user: createdUsers[2]._id }
      ],
      category: 'food',
      date: new Date('2024-01-18'),
      createdBy: createdUsers[2]._id
    });

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Groups: 1`);
    console.log(`   Expenses: 3`);
    console.log('\n🔑 Demo User Credentials:');
    console.log('   Email: alex.johnson@example.com');
    console.log('   Email: sarah.chen@example.com');
    console.log('   Email: mike.brown@example.com');
    console.log('   Email: emma.wilson@example.com');
    console.log('   Email: james.lee@example.com');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

seedDatabase();
