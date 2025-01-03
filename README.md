# Orantio - A Mobile Messaging Application

Orantio is a mobile messaging platform, designed to enhance your communication experience through seamless connectivity and powerful features. Whether you're chatting one-on-one or collaborating in large groups, our platform provides an intuitive and secure space for all your conversations. With real-time online presence and support for multiple devices, you'll never miss a moment—stay connected effortlessly across all your favorite devices.

> This is the final group project from two courses in VNUHCM - University of Science - CS426 - Mobile Device Application Development and CS300 - Introduction to Software Engineering.

![image](https://github.com/user-attachments/assets/81a1a1a5-3806-40c1-8a49-928236ac4e5d)

## Features

1. Group Messaging
    - Server Channel Conversations is the primary feature of our application, Orantio. A user can add, edit, or delete messages in a channel and reply to messages. Additionally, users can express their reactions using emojis, and upload images, videos, and other attachments with other users.
2. Online Presence
    - A user can know whenever other users are online. He/she can also share his/her status with other users by setting his/her custom status.
3. Multiple Device Support
    - The same account can be logged in to multiple accounts at the same time.
4. Server Management
    - The server owner can decide what other members in a server can do through the use of server roles & permissions. It is used when we want to categorize a set of users with predefined permissions (server role with admin permissions, or just basic permissions for a user to interact with components in the server freely).
    - The server owner can also restrict a user from a server by kicking a user out of a server or banning that user.
5. User Management
    - Enable user registration, login, and authentication to ensure secure access to the application.
    - A user can upload his/her avatar, edit his/her status, and befriend other users.
6. Premium Subscription
    - Integrate modern payment methods that allow users to buy premium subscriptions to have access to premium privileges.
    - A free user and a paid user will have different user interfaces with different features and support.

## Releases

The application is currently available on both Android and iOS, you can download it from: [Releases](https://drive.google.com/drive/folders/1f4hMgw-ejAeCoTmEvTNTC5w5bsk0XVha?usp=drive_link).
- Note: Push notifications are only available on Android devices.

## Demonstration

Here is the video demo of the project on YouTube: [CS426 - Orantio Demonstration](https://youtu.be/yxmciwkagPo) (outdated).

## Repositories

The project contains four repositories:
- [Mobile Frontend](https://github.com/mobile-apcs-ntploc21/mobile-frontend): This repository contains all the source code for the Mobile Application that supports both Android and iOS, written in React Native.
- [Mobile Backend](https://github.com/mobile-apcs-ntploc21/mobile-backend): This repository contains all the source code for the backend system that handles all the requests from client (Mobile Application).
- [Notification Service](https://github.com/mobile-apcs-ntploc21/notification-service): This repository contains all the source code for the notification service that sends push notifications to users.
- [Monitoring Service](https://github.com/mobile-apcs-ntploc21/monitoring-service): This repository contains all the source code for the deployment of monitoring service that monitors the server's performance and logs.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](https://github.com/mobile-apcs-ntploc21/mobile-backend/blob/master/LICENSE) file for details.

## Technologies

### Mobile:
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)

### Backend (Server):
- [ExpressJs](https://expressjs.com/)
- [NodeJS](https://nodejs.org/en/)
- [Apollo GraphQL](https://www.apollographql.com/)

### Notification Service:
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Java Spring Boot](https://spring.io/projects/spring-boot)
- [RabbitMQ](https://www.rabbitmq.com/)

### Deployment:
- [Amazon Lightsail](https://aws.amazon.com/free/compute/lightsail) (Backend and Notification Service)
- [Docker](https://www.docker.com/)
- [NGiNX](https://nginx.org/en/)
- [Amazon Route53](https://aws.amazon.com/route53/) (DNS Service)
- [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine) (Monitoring Service)

### Database
- [MongoDB](https://www.mongodb.com/lp/cloud/atlas/try4)

### Content Storage (Images, Attachments, etc)
- [Amazon S3](https://aws.amazon.com/s3/)
- [Amazon CloudFront](https://aws.amazon.com/cloudfront/) (Content Delivery Network - CDN)

## Installation (Backend System)

### Manual Installation

Ensure you have NodeJS installed on your machine. If not, you can download it from [NodeJS](https://nodejs.org/en/).

1. Clone the repository:
```bash
git clone https://github.com/mobile-apcs-ntploc21/mobile-backend.git
```

2. Install PNPM globally:
```bash
npm install -g pnpm
```

3. Install the dependencies:
```bash
pnpm install
```

4. Go to folders `api` and `apollo` you need to make a file called `config.env` from the provided template `config.env.template` and fill in the necessary information.

5. Start the server:
```bash
pnpm start
```

If you want to run the server in development mode, you can use the following command:
```bash
pnpm dev
```

### Docker Installation

Ensure you have Docker installed on your machine. If not, you can download it from [Docker](https://www.docker.com/).

1. Clone the repository:
```bash
git clone https://github.com/mobile-apcs-ntploc21/mobile-backend.git
```

2. Go to folders api and apollo you need to make a file called config.env from the provided template config.env.template and fill in the necessary information.

3. Build the Docker image:
```bash
docker-compose build
```

4. Start the Docker container:
```bash
docker-compose up
```
Note: You need to run the [`notification-service`](https://github.com/mobile-apcs-ntploc21/notification-service) following the Docker installation guide to enable the notification feature before running the [`mobile-backend`](https://github.com/mobile-apcs-ntploc21/mobile-backend).

## Contributor

The project could not have been completed without these developers!

- 22125050 - Nguyễn Thanh Phước Lộc
  - ntploc22@apcs.fitus.edu.vn
- 22125068 - Trương Chí Nhân
  - tcnhan22@apcs.fitus.edu.vn
- 22125076 - Nguyễn Hoàng Phúc
  - nhphuc221@apcs.fitus.edu.vn
- 22125115 - Ngô Hoàng Tuấn
  - nhtuan22@apcs.fitus.edu.vn
- 22125121 - Đinh Hoàng Việt
  - dhviet22@apcs.fitus.edu.vn
