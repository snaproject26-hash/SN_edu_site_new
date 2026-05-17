const path = require("path");
const dotenv = require("dotenv");
const database = require("../config/database");
const bcrypt = require("bcryptjs");

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const Category = require("../models/Category");
const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const CourseProgress = require("../models/CourseProgress");
const RatingAndReview = require("../models/RatingAndRaview");

const DEFAULT_THUMBNAIL =
  "https://res.cloudinary.com/djcs7j8xo/image/upload/v1778998807/course_image_m11t0w.webp";
const DEFAULT_VIDEO_URL =
  "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4";

async function clearData() {
  console.log("Clearing existing seed data...");
  await Promise.all([
    Category.deleteMany({}),
    Profile.deleteMany({}),
    User.deleteMany({}),
    Course.deleteMany({}),
    Section.deleteMany({}),
    SubSection.deleteMany({}),
    CourseProgress.deleteMany({}),
    RatingAndReview.deleteMany({}),
  ]);
  console.log("Collections cleared.");
}

async function createUser(userPayload) {
  const profile = await Profile.create({
    gender: userPayload.gender || "Not specified",
    dateOfBirth: userPayload.dateOfBirth || "",
    about: userPayload.about || "",
    contactNumber: userPayload.contactNumber || null,
  });

  const hashedPassword = await bcrypt.hash(userPayload.password, 10);
  const user = await User.create({
    firstName: userPayload.firstName,
    lastName: userPayload.lastName,
    email: userPayload.email,
    password: hashedPassword,
    accountType: userPayload.accountType,
    approved: true,
    additionalDetails: profile._id,
    image: userPayload.image || "",
    courses: [],
    courseProgress: [],
  });

  return { user, profile };
}

async function createCourse(coursePayload) {
  const course = await Course.create({
    courseName: coursePayload.courseName,
    courseDescription: coursePayload.courseDescription,
    instructor: coursePayload.instructor,
    whatYouWillLearn: coursePayload.whatYouWillLearn,
    price: coursePayload.price,
    tag: coursePayload.tag,
    category: coursePayload.category,
    thumbnail: coursePayload.thumbnail || DEFAULT_THUMBNAIL,
    status: coursePayload.status || "Published",
    instructions: coursePayload.instructions || [],
    studentsEnrolled: [],
    courseContent: [],
    ratingAndReviews: [],
  });

  await User.findByIdAndUpdate(coursePayload.instructor, {
    $push: { courses: course._id },
  });

  await Category.findByIdAndUpdate(coursePayload.category, {
    $push: { courses: course._id },
  });

  return course;
}

async function addSectionWithSubsections(courseId, sectionName, subsections) {
  const section = await Section.create({ sectionName });
  const subIds = [];

  for (const sub of subsections) {
    const subsection = await SubSection.create({
      title: sub.title,
      description: sub.description,
      timeDuration: sub.timeDuration,
      videoUrl: sub.videoUrl || DEFAULT_VIDEO_URL,
    });
    subIds.push(subsection._id);
  }

  await Section.findByIdAndUpdate(section._id, {
    $push: { subSection: { $each: subIds } },
  });
  await Course.findByIdAndUpdate(courseId, {
    $push: { courseContent: section._id },
  });

  return { sectionId: section._id, subSectionIds: subIds };
}

async function enrollStudent(studentId, courseId, completedSubsections = []) {
  const progress = await CourseProgress.create({
    courseID: courseId,
    userId: studentId,
    completedVideos: completedSubsections,
  });

  await Course.findByIdAndUpdate(courseId, {
    $addToSet: { studentsEnrolled: studentId },
  });

  await User.findByIdAndUpdate(studentId, {
    $addToSet: { courses: courseId, courseProgress: progress._id },
  });

  return progress;
}

async function createReview(userId, courseId, rating, review) {
  const ratingDoc = await RatingAndReview.create({
    user: userId,
    rating,
    review,
    course: courseId,
  });

  await Course.findByIdAndUpdate(courseId, {
    $push: { ratingAndReviews: ratingDoc._id },
  });

  return ratingDoc;
}

async function seed() {
  await database.connect();
  await clearData();

  const categories = await Category.insertMany([
    {
      name: "Development",
      description: "Courses for web, mobile, and backend development.",
    },
    {
      name: "Design",
      description: "Courses covering UX, UI, and product design.",
    },
    {
      name: "Business",
      description: "Courses on entrepreneurship, marketing, and strategy.",
    },
  ]);

  const [developmentCategory, designCategory, businessCategory] = categories;

  const adminData = await createUser({
    firstName: "Site",
    lastName: "Admin",
    email: "admin@example.com",
    password: "Admin@123",
    accountType: "Admin",
    contactNumber: 9000000001,
    gender: "Other",
    about: "Platform administrator.",
  });

  const instructorAliceData = await createUser({
    firstName: "Alice",
    lastName: "Instructor",
    email: "alice.instructor@example.com",
    password: "Instructor@123",
    accountType: "Instructor",
    contactNumber: 9000000002,
    gender: "Female",
    about: "Frontend engineer and instructor.",
  });

  const instructorBobData = await createUser({
    firstName: "Bob",
    lastName: "Instructor",
    email: "bob.instructor@example.com",
    password: "Instructor@123",
    accountType: "Instructor",
    contactNumber: 9000000003,
    gender: "Male",
    about: "Product designer and teacher.",
  });

  const studentSamData = await createUser({
    firstName: "Sam",
    lastName: "Student",
    email: "sam.student@example.com",
    password: "Student@123",
    accountType: "Student",
    contactNumber: 9000000004,
    gender: "Male",
    about: "Aspiring developer.",
  });

  const studentMiraData = await createUser({
    firstName: "Mira",
    lastName: "Student",
    email: "mira.student@example.com",
    password: "Student@123",
    accountType: "Student",
    contactNumber: 9000000005,
    gender: "Female",
    about: "Design student.",
  });

  const courseReact = await createCourse({
    courseName: "Modern React with Hooks",
    courseDescription:
      "A hands-on course covering React hooks, component design, and state management.",
    whatYouWillLearn:
      "Build reusable React components, manage state and side effects, and structure projects.",
    price: 799,
    tag: ["React", "Frontend", "JavaScript"],
    category: developmentCategory._id,
    instructor: instructorAliceData.user._id,
    thumbnail: DEFAULT_THUMBNAIL,
    status: "Published",
    instructions: [
      "Follow each lesson in order",
      "Complete the exercises after every section",
      "Build the sample project to practice",
    ],
  });

  const courseDesign = await createCourse({
    courseName: "UI/UX Design Fundamentals",
    courseDescription:
      "An introductory design course teaching user research, wireframing, and prototyping.",
    whatYouWillLearn:
      "Create wireframes, user journeys, and responsive interfaces using modern design principles.",
    price: 599,
    tag: ["Design", "UX", "Product"],
    category: designCategory._id,
    instructor: instructorBobData.user._id,
    thumbnail: DEFAULT_THUMBNAIL,
    status: "Published",
    instructions: [
      "Study the user-centered design process",
      "Practice with real design examples",
      "Review and iterate on your work.",
    ],
  });

  const courseBusiness = await createCourse({
    courseName: "Startup Marketing Essentials",
    courseDescription:
      "A beginner-friendly business course on growth strategy, positioning, and digital marketing.",
    whatYouWillLearn:
      "Develop a marketing plan, refine your value proposition, and launch campaigns.",
    price: 499,
    tag: ["Business", "Marketing", "Strategy"],
    category: businessCategory._id,
    instructor: instructorAliceData.user._id,
    thumbnail: DEFAULT_THUMBNAIL,
    status: "Published",
    instructions: [
      "Study customer personas",
      "Practice marketing frameworks",
      "Measure results using real metrics.",
    ],
  });

  await addSectionWithSubsections(courseReact._id, "Getting Started", [
    {
      title: "Introduction to React",
      description: "Why React is the leading frontend library.",
      timeDuration: "240",
    },
    {
      title: "Project Setup",
      description: "Set up your React development environment.",
      timeDuration: "180",
    },
  ]);

  await addSectionWithSubsections(courseReact._id, "Core React Patterns", [
    {
      title: "Hooks and State",
      description: "UseState, useEffect, and custom hooks.",
      timeDuration: "360",
    },
    {
      title: "Component Architecture",
      description: "Organize reusable and maintainable components.",
      timeDuration: "300",
    },
  ]);

  await addSectionWithSubsections(courseDesign._id, "Design Process", [
    {
      title: "User Research Basics",
      description: "Understand your users and their needs.",
      timeDuration: "320",
    },
    {
      title: "Information Architecture",
      description: "Structure content for clear navigation.",
      timeDuration: "260",
    },
  ]);

  await addSectionWithSubsections(
    courseDesign._id,
    "Wireframing and Prototyping",
    [
      {
        title: "Wireframe Creation",
        description: "Design low-fidelity layouts for key pages.",
        timeDuration: "280",
      },
      {
        title: "Interactive Prototypes",
        description: "Build prototypes to validate user flows.",
        timeDuration: "320",
      },
    ],
  );

  await addSectionWithSubsections(courseBusiness._id, "Growth Fundamentals", [
    {
      title: "Value Proposition",
      description: "Define what makes your product unique.",
      timeDuration: "240",
    },
    {
      title: "Marketing Channels",
      description: "Choose the right channels for your audience.",
      timeDuration: "300",
    },
  ]);

  await enrollStudent(studentSamData.user._id, courseReact._id, []);
  await enrollStudent(studentSamData.user._id, courseDesign._id, []);
  await enrollStudent(studentMiraData.user._id, courseReact._id, []);

  await createReview(
    studentSamData.user._id,
    courseReact._id,
    5,
    "Excellent React course with clear examples.",
  );
  await createReview(
    studentMiraData.user._id,
    courseReact._id,
    4,
    "Good content and easy to follow.",
  );

  console.log("Seed data created successfully.");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed script failed:", error);
  process.exit(1);
});
