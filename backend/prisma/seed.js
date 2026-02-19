const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create sample users
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash('password123', saltRounds);

  // Create instructor
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: {
      name: 'Dr. Sarah Johnson',
      email: 'instructor@example.com',
      password: hashedPassword,
      role: 'INSTRUCTOR'
    }
  });

  // Create students
  const student1 = await prisma.user.upsert({
    where: { email: 'student1@example.com' },
    update: {},
    create: {
      name: 'Alice Smith',
      email: 'student1@example.com',
      password: hashedPassword,
      role: 'STUDENT'
    }
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@example.com' },
    update: {},
    create: {
      name: 'Bob Johnson',
      email: 'student2@example.com',
      password: hashedPassword,
      role: 'STUDENT'
    }
  });

  const student3 = await prisma.user.upsert({
    where: { email: 'student3@example.com' },
    update: {},
    create: {
      name: 'Carol Williams',
      email: 'student3@example.com',
      password: hashedPassword,
      role: 'STUDENT'
    }
  });

  console.log('✅ Users created');

  // Create sample assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      title: 'Introduction to Machine Learning',
      description: 'Write a comprehensive essay discussing the fundamental concepts of machine learning, including supervised and unsupervised learning, common algorithms, and real-world applications. Your essay should be 800-1000 words and include specific examples.',
      createdBy: instructor.id
    }
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      title: 'Climate Change Impact Analysis',
      description: 'Analyze the impact of climate change on a specific ecosystem or region. Discuss the causes, effects, and potential solutions. Include data and evidence to support your arguments. Minimum 1000 words.',
      createdBy: instructor.id
    }
  });

  const assignment3 = await prisma.assignment.create({
    data: {
      title: 'Web Development Project Proposal',
      description: 'Create a detailed proposal for a web application that solves a real-world problem. Include technical specifications, user interface design, implementation timeline, and budget considerations.',
      createdBy: instructor.id
    }
  });

  console.log('✅ Assignments created');

  // Create sample submissions
  const submission1 = await prisma.submission.create({
    data: {
      content: `Machine Learning: Transforming Data into Intelligence

Machine learning represents a revolutionary approach to computer programming that enables systems to learn and improve from experience without being explicitly programmed. This paradigm shift has transformed how we approach complex problems across numerous industries, from healthcare to finance to transportation.

At its core, machine learning algorithms identify patterns in data and use these patterns to make predictions or decisions. Unlike traditional programming, where developers write explicit rules, machine learning models discover these rules automatically through training on large datasets.

Supervised learning forms the foundation of most practical machine learning applications. In this approach, algorithms learn from labeled training data, where each example includes both input features and the correct output. Common supervised learning algorithms include linear regression for predicting continuous values, decision trees for classification tasks, and neural networks for complex pattern recognition. These algorithms have found applications in spam filtering, medical diagnosis, and stock price prediction.

Unsupervised learning, by contrast, deals with unlabeled data and aims to discover hidden patterns or intrinsic structures. Clustering algorithms group similar data points together, while dimensionality reduction techniques like PCA help visualize high-dimensional data. These methods are crucial for customer segmentation, anomaly detection, and data compression.

Deep learning, a subset of machine learning inspired by the human brain's neural networks, has achieved remarkable success in recent years. Convolutional neural networks excel at image recognition, while recurrent neural networks process sequential data like text or speech. These advances have powered breakthrough applications ranging from autonomous vehicles to language translation.

The real-world impact of machine learning continues to grow exponentially. In healthcare, ML algorithms assist in diagnosing diseases from medical images and predicting patient outcomes. Financial institutions use machine learning for fraud detection and risk assessment. Retail companies leverage recommendation systems to personalize customer experiences.

However, machine learning also presents significant challenges. Data quality and quantity directly impact model performance, raising concerns about bias and fairness. The "black box" nature of some complex models makes it difficult to interpret their decisions, creating transparency issues. Additionally, the computational resources required for training large models can be substantial.

Looking forward, machine learning continues to evolve rapidly. Emerging trends include federated learning, which enables model training without centralizing data, and few-shot learning, which allows models to learn from minimal examples. As these technologies mature, they will likely transform virtually every aspect of our digital economy.

In conclusion, machine learning represents not just a technological advancement but a fundamental shift in how we process information and make decisions. Its ability to learn from data and improve over time makes it uniquely suited to address the complex challenges of our increasingly data-driven world.`,
      assignmentId: assignment1.id,
      studentId: student1.id,
      plagiarismRisk: 15.5,
      feedbackSummary: 'Excellent comprehensive overview of machine learning concepts. Good structure and examples. Consider adding more recent developments and ethical considerations.',
      score: 85,
      status: 'EVALUATED'
    }
  });

  const submission2 = await prisma.submission.create({
    data: {
      content: `Climate Change and Coral Reef Ecosystems: A Critical Analysis

Coral reefs represent one of Earth's most diverse and valuable ecosystems, yet they face unprecedented threats from climate change. These underwater structures, built by tiny coral polyps over thousands of years, support approximately 25% of all marine species despite covering less than 1% of the ocean floor.

The primary driver of climate change impacts on coral reefs is ocean warming. As global temperatures rise, sea surface temperatures increase, causing coral bleaching events. When water becomes too warm, corals expel the symbiotic algae living in their tissues, causing them to turn white and become vulnerable to disease. The Great Barrier Reef has experienced mass bleaching events in 2016, 2017, 2020, and 2022, with increasing frequency and severity.

Ocean acidification presents another critical threat. As atmospheric CO2 levels rise, oceans absorb more carbon dioxide, lowering seawater pH. This acidification reduces the ability of corals and other calcifying organisms to build their skeletons, slowing reef growth and making structures more fragile.

Climate change also intensifies extreme weather events that damage coral reefs. Hurricanes and cyclones, increasing in intensity due to warmer ocean waters, can physically destroy reef structures. These storms also increase runoff from land, bringing pollutants and sediments that smother corals.

The cascading effects of reef degradation extend far beyond the corals themselves. Fish populations that depend on reefs for habitat and food decline, affecting fisheries that feed millions of people. Coastal communities lose natural protection from storm surges, increasing vulnerability to erosion and flooding. Tourism economies built around reef ecosystems suffer significant losses.

Conservation efforts must address both local and global factors. Marine protected areas help reduce local stressors like overfishing and pollution. However, without addressing climate change, these measures provide only temporary relief. Restoration techniques like coral gardening and assisted evolution show promise but cannot keep pace with current degradation rates.

International cooperation is essential for effective climate action. The Paris Agreement provides a framework for reducing emissions, but current commitments remain insufficient to limit warming to 1.5°C above pre-industrial levels. Accelerating the transition to renewable energy, improving energy efficiency, and protecting natural carbon sinks are critical strategies.

Individual actions also contribute to the solution. Reducing carbon footprints through lifestyle changes, supporting sustainable businesses, and advocating for stronger climate policies can create collective impact. Education and awareness campaigns help build public support for necessary changes.

The future of coral reefs depends on immediate and sustained action to address climate change. While the challenges are significant, the resilience of these ecosystems and human innovation offer hope. By combining local conservation with global climate action, we can work toward preserving these invaluable ecosystems for future generations.`,
      assignmentId: assignment2.id,
      studentId: student2.id,
      plagiarismRisk: 8.2,
      feedbackSummary: 'Well-researched analysis with strong scientific evidence. Good coverage of multiple impacts. Could benefit from more specific quantitative data and proposed solutions.',
      score: 78,
      status: 'EVALUATED'
    }
  });

  const submission3 = await prisma.submission.create({
    data: {
      content: `EduConnect: Bridging Educational Gaps Through Technology

Project Overview
EduConnect is a comprehensive web platform designed to address educational inequality by connecting students in underserved communities with volunteer tutors and educational resources. The platform leverages modern web technologies to create an accessible, scalable solution for personalized learning support.

Technical Architecture
The platform will be built using the MERN stack (MongoDB, Express.js, React, Node.js) for optimal performance and scalability. The frontend will utilize React with TypeScript for type safety and improved development experience. State management will be handled through Redux Toolkit, ensuring predictable state updates across the application.

The backend architecture will implement a microservices approach, with separate services for user management, session scheduling, and content delivery. This design allows for independent scaling and maintenance of different platform components. Real-time communication will be facilitated through WebRTC for video tutoring sessions and Socket.IO for instant messaging.

Database Design
MongoDB will serve as the primary database, chosen for its flexibility in handling diverse data types and horizontal scaling capabilities. The data model will include collections for users, sessions, resources, and analytics. Redis will be implemented for caching frequently accessed data and managing session states.

User Interface Design
The platform will feature a responsive, accessible design following WCAG 2.1 guidelines. The user interface will prioritize simplicity and ease of use, particularly for users with limited technical experience. Key features include:

- Dashboard with personalized learning paths
- Interactive virtual classroom with whiteboard functionality
- Resource library with searchable educational materials
- Progress tracking and analytics for students and tutors
- Secure messaging and file sharing capabilities

Implementation Timeline
Phase 1 (Months 1-2): Foundation Development
- Set up development environment and CI/CD pipeline
- Implement user authentication and authorization systems
- Create basic UI components and design system
- Develop core database schema and APIs

Phase 2 (Months 3-4): Core Features
- Build virtual classroom functionality
- Implement session scheduling system
- Create resource library and content management
- Develop messaging and notification systems

Phase 3 (Months 5-6): Advanced Features
- Add analytics and reporting capabilities
- Implement AI-powered learning recommendations
- Create mobile-responsive design
- Conduct comprehensive testing and optimization

Budget Considerations
Development Costs: $45,000
- Frontend development: $15,000
- Backend development: $20,000
- UI/UX design: $5,000
- Testing and QA: $5,000

Infrastructure Costs (Year 1): $18,000
- Cloud hosting (AWS/Azure): $12,000
- Database services: $3,000
- CDN and storage: $2,000
- Monitoring and security: $1,000

Operational Costs (Year 1): $25,000
- Marketing and user acquisition: $15,000
- Customer support: $5,000
- Content creation and licensing: $3,000
- Legal and administrative: $2,000

Total First-Year Investment: $88,000

Revenue Model
The platform will operate on a freemium model, offering basic services free to students while generating revenue through:

- Premium tutoring services ($20/hour)
- School and district partnerships ($5,000/year)
- Corporate sponsorship programs
- Data analytics services for educational institutions

Impact Metrics
Success will be measured through:
- Number of active students and tutors
- Session completion rates
- Academic improvement metrics
- User satisfaction scores
- Platform accessibility metrics

Risk Mitigation
Key risks include technical scalability, user adoption challenges, and regulatory compliance. Mitigation strategies include phased rollout, comprehensive user testing, and legal consultation throughout development.

Conclusion
EduConnect represents a significant opportunity to leverage technology for educational equity. The platform's comprehensive approach, combining technical innovation with educational expertise, positions it for meaningful impact in addressing learning gaps in underserved communities.`,
      assignmentId: assignment3.id,
      studentId: student3.id,
      plagiarismRisk: 12.8,
      feedbackSummary: 'Comprehensive and well-structured proposal. Good technical detail and realistic planning. Consider more specific user research and competitive analysis.',
      score: 82,
      status: 'EVALUATED'
    }
  });

  console.log('✅ Sample submissions created');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Login Credentials:');
  console.log('Instructor: instructor@example.com / password123');
  console.log('Student 1: student1@example.com / password123');
  console.log('Student 2: student2@example.com / password123');
  console.log('Student 3: student3@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
