# Media Sharing Platform

## Technologies Used

- **Frontend/Desktop**: React.
- **Frontend/mobile**: React Native (Expo)
- **Backend**: Nodejs, TypeScript.
- **Database**:PostGres (Hosted on supabase).

  
## **Features**

- **User Authentication**: Secure login and register using jwt.
- **like system**: users can like/unlike other users posts.
- **CRUD operations**: User can upload, edit and remove his posts.
  
## Explaining technology, database and tools choices

- **React Masonry**: I utilized React Masonry to easily create a responsive, dynamic grid layout for the user interface.
- **Postgres**: I wanted a relational database that could efficiently handle structured related data like a " like related to a user and a post " and also a db that handles large data and finally a good concurrency control.
- **Supabase**: First reason: easily manage postgres db and second reason its free bucket storage.
  
## Demo 
-**User Can Like Other People's Post on Main Page**: 

https://github.com/user-attachments/assets/a6a38ff1-6c99-4ec7-84db-7b9ada02ff97

-**User Can Upload photo and video**: 

https://github.com/user-attachments/assets/df12eee0-69c1-4610-82b4-c1fcade3f9b7

-**Masonry Layout**: 
<img width="842" alt="layout" src="https://github.com/user-attachments/assets/a48bb0df-4e9b-49db-8441-51fa500ada72">


## **Incomplete**
- **Tried to make a mobile version with react-native-expo but i had no prior experience with it so i only reached to make the base structure with the time i had as i started the assignment late**:

## Installation Guide

### 1. Clone the repository
First, clone the repository to your local machine:

```bash
git clone https://github.com/Hossam-El-Batal/Media-sharing-platform
cd Media-sharing-platform

### 2. run backend 
cd backend
npm install
npm start

### 3. run frontend
cd frontend-desktop
npm install
npm run dev

### 4. you will need supabase env variables !









