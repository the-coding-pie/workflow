# Workflow

A fullstack Project Management Software made using React JS (Typescript), Node JS + Express (Typescript), and Mongo DB.

<img src="https://user-images.githubusercontent.com/63698375/161479812-a9f32870-66f1-484d-9ea7-20f6f66fe95e.png" alt="boardDetailPage" style="width:100%;"/>

## Technologies Used:

 ### Frontend

  - React JS + Typescript
  - React Query
  - Redux Toolkit
  - Tailwind CSS
  - Formik + Yup
  - React Beautiful DND
  - React Toastify
  - React Select
  
### Backend

 - Node JS + Express + Typescript
 - Mongo DB (with Mongoose)
 - JWT tokens & Google Auth for authentication
 - Node Mailer
 
 ## Features
 
 - Signup and Login (Email + Password & Google OAuth)
 - HomePage
 - Profile Settings
 - Space CRUD (with Role -> ADMIN & NORMAL)
 - Space Members CRUD
 - Board CRUD (with Role -> ADMIN, NORMAL, and OBSERVER)
 - Board Members CRUD
 - List CRUD
 - List Drag & Drop (reordering)
 - Card CRUD
 - Card Drag & Drop (reordering)
 - Card comments CRUD (with Role)
 - Card Members CRUD (with Role)
 - Card Labels (with Role)
 - Card Due Date (with Role)
 - Card Cover Image (with Role)
 - Labels CRUD (with Role)
 - JWT based auth (both accessToken and refreshToken)
 - Google OAuth
 - Favorites (make both Space & Board favorite) etc.

## Description

A fully fledged project management software which was built by taking inspiration from Trello, one of the pioneers in this space. 

### Hierarchy
In Workspace, there is a hierarchy you need to follow:

![hierarchy](https://user-images.githubusercontent.com/63698375/161477315-ec114415-ac57-4cd7-a049-5dfa9d2a1d3c.png)

### Role based CRUD
In space level, as well as in board level, role based CRUD is implemented. The UI will be rendered according to the role which the user has. In short everything is done based on the role(power) the user have.

In Space, there are two roles -> ADMIN, NORMAL
In Board, there are three roles -> ADMIN, NORMAL, OBSERVER

### Email verification
Email verification is also implemented in authentication flow. Unless until you confirm your email (by clicking on the link which was sent inside email to the email address you have given), you won't be able to use this app at all.

### Labels in Board Level
Labels are used in board level. Each label of the board will be available to assign to a card belongs to that board. Labels will be useful in aspects such as searching the cards and filtering it (haven't implemented it yet).

![labels](https://user-images.githubusercontent.com/63698375/161478252-bcfa96fa-94fa-4ce2-9b76-8f6dd5ba6686.png)

### Ranking Lists & Cards
A technique called "Lexorank" is used for giving weights to cards as well as lists, so that they will keep the order. Lexorank is ranking system that Jira Software uses which provides the ability to rank issues in Jira Software instances. But in this project, I used Lexorank without the bucket feature.

### Auth Flow
![authflow_final](https://user-images.githubusercontent.com/63698375/161480269-13bbf11b-5379-477d-92ff-8854b16c5631.png)


 
 
 ## How to setup locally on your computer
 
  In order to run this project on your computer, you must have the following technologies installed on your computer:
 
  - Docker
  
 ### Steps

1. `git clone` or `Download ZIP` this repo `https://github.com/the-coding-pie/workflow.git`
2. Now `cd` into the root directory (ie, workflow): 
 
``` bash
cd workflow
```
3. Now create two `.env` files, one in `/server` folder and another in `/client` folder.
4. Now copy paste the content for `.env` in `/server` folder. Please **replace** the proper values by yours:

```
PORT=8000

MONGO_URI=your_mongodb_atlas_uri

REFRESH_TOKEN_SECRET=strong_random_characters
ACCESS_TOKEN_SECRET=strong_random_characters

GOOGLE_CLIENT_ID=your_google_client-id_for_google_oauth

GMAIL=any_email_address_for_sending_email_from
GMAIL_PASSWORD=that_emails_password
```

You can obtain google client id for google oauth by simply searching google and following the steps recommended. And for gmail(last two options), please use app specific passwords.

5. Now copy paste the content for `.env` in `/client` folder. Please **replace** the proper values by yours:

```
VITE_UNSPLASH_CLIENT_ID=your_unsplash_client_id
```

Please obtain a client id for using Unsplash API.

6. Make sure you have Docker properly setup. Now fire this command:

``` bash
docker-compose up
```
4. That's it, Now visit [http://localhost:3000](http://localhost:3000)


[Designed](https://www.figma.com/file/WKTWThfTPOu7nMo4oa59jH/Workflow) and developed with ❤️ by [@AK](https://twitter.com/aravind_k28) (that's me ;)

