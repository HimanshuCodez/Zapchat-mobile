import { config } from "dotenv";
import { connectDB } from "../utils/db.js";
import User from "../models/user.model.js";

config();

const seedUsers = [
  // Female Users
  {
    email: "lisa.manobal@gmail.com",
    fullname: "lisa Manobal",
    password: "123456",
    profilePic: "https://i.pinimg.com/236x/7c/4c/cf/7c4ccf6f8666cc201890e690a6d6932a.jpg",
    number : 8932893444,
  },
  {
    email: "Roseanne.Park@gmail.com",
    fullname: "Rose",
    password: "123456",
    profilePic: "https://i.pinimg.com/474x/e9/4a/7b/e94a7b7b24d6f80798ded6bf7fec4241.jpg",
    number : 1932893829
  },
  {
    email: "jimin@gmail.com",
    fullname: "Park Ji-min",
    password: "123456",
    profilePic: "https://i.pinimg.com/236x/d4/67/fb/d467fbca1ede7f9001e229cba9ed4af9.jpg",
    number : 8232893829,
  },
  {
    email: "jeon jungkook@gmail.com",
    fullname: "jeon jungkook",
    password: "123456",
    profilePic: "https://i.pinimg.com/236x/f3/8d/43/f38d43efd38eff61ded48d0daf020e1d.jpg",
    number : 8332893829,
  },
  {
    email: "isabella.brown@example.com",
    fullname: "Isabella Brown",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/5.jpg",
    number : 9932893829,
  },
  {
    email: "mia.johnson@example.com",
    fullname: "Mia Johnson",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/6.jpg",
    number : 9232893829,
  },
  {
    email: "charlotte.williams@example.com",
    fullname: "Charlotte Williams",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/7.jpg",
    number : 9432893829,
  },
  {
    email: "amelia.garcia@example.com",
    fullname: "Amelia Garcia",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/8.jpg",
    number : 9632893829,
  },

  
  {
    email: "james.anderson@example.com",
    fullname: "James Anderson",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
    number : 8932893821,
  },
  {
    email: "william.clark@example.com",
    fullname: "William Clark",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/2.jpg",
    number : 1932893821,
  },
 
  {
    email: "lucas.moore@example.com",
    fullname: "Lucas Moore",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/4.jpg",
    number : 8332893827,
  },
  {
    email: "henry.jackson@example.com",
    fullname: "Henry Jackson",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/5.jpg",
    number : 9932893824,
  },
  {
    email: "alexander.martin@example.com",
    fullname: "Alexander Martin",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/6.jpg",
    number : 9232893823,
  },
  {
    email: "daniel.rodriguez@example.com",
    fullname: "Daniel Rodriguez",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/7.jpg",
    number : 9432893826,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    await User.insertMany(seedUsers);
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Call the function
seedDatabase();