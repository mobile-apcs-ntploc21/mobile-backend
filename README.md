# Orantio - A Mobile Messaging Application

Orantio is a mobile messaging platform, designed to enhance your communication experience through seamless connectivity and powerful features. Whether you're chatting one-on-one or collaborating in large groups, our platform provides an intuitive and secure space for all your conversations. With real-time online presence and support for multiple devices, you'll never miss a moment—stay connected effortlessly across all your favorite devices.

> This is the final group project from a course in VNUHCM - University of Science - CS426 - Mobile Device Application Development.

![image](https://github.com/user-attachments/assets/81a1a1a5-3806-40c1-8a49-928236ac4e5d)

Project Documentation (Report): 
[Orantio - Final Project Report](https://docs.google.com/document/d/1JKH1tpbLIcx2oh7RjDSPgTujh9yx4NycOP6JxVRhfdg/edit?usp=sharing)

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

## Demonstration

Here is the video demo of the project on YouTube: [CS426 - Orantio Demonstration](https://youtu.be/yxmciwkagPo).

## Repositories

The project contains two repositories:
- [Mobile Frontend](https://github.com/mobile-apcs-ntploc21/mobile-frontend): This repository contains all the source code for the Mobile Application that supports both Android and iOS, written in React Native.
  - Number of commits (last updated 15/09/2024): 535 commits.
  - Link to [commit history](https://github.com/mobile-apcs-ntploc21/mobile-frontend/commits/master/).
- [Mobile Backend](https://github.com/mobile-apcs-ntploc21/mobile-backend): This repository contains all the source code for the backend system that handles all the requests from client (Mobile Application).
  - Number of commits (last updated 14/09/2024): 265 commits.
  - Link to [commit history](https://github.com/mobile-apcs-ntploc21/mobile-backend/commits/master/).

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

### Deployment:
- [Amazon Lightsail](https://aws.amazon.com/free/compute/lightsail)
- [Docker](https://www.docker.com/)
- [NGiNX](https://nginx.org/en/)
- [Amazon Route53](https://aws.amazon.com/route53/) (DNS Service)

### Database
- [MongoDB](https://www.mongodb.com/lp/cloud/atlas/try4)

### Content Storage (Images, Attachments, etc)
- [Amazon S3](https://aws.amazon.com/s3/)
- [Amazon CloudFront](https://aws.amazon.com/cloudfront/) (Content Delivery Network - CDN)

## Installation (Backend System)

Ensure you have NodeJS installed on your machine. If not, you can download it from [NodeJS](https://nodejs.org/en/).

1. Install PNPM globally:
```bash
npm install -g pnpm
```

2. Clone the repository:
```bash
git clone https://github.com/mobile-apcs-ntploc21/mobile-backend.git
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
