import React, { useState, useEffect } from 'react';
import 'rbx/index.css';
import { Button, Container, Title, Message } from 'rbx';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from './shared/firebase.js'
import CourseList from './components/CourseList';

const uiConfig = {
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: () => false
  }
};

const db = firebase.database().ref();

// Banner component to display title
// destructuring syntax to get values we want from an object 
const Banner = ({user, title}) => (
  <React.Fragment>
  { user ? <Welcome user={ user } /> : <SignIn /> }
  <Title>{title || '[loading...]' }</Title>
  </React.Fragment>
)
firebase.auth().signOut()

const Welcome = ({ user }) => (
  <Message color="info">
    <Message.Header>
      Welcome, {user.displayName}
      <Button primary onClick={() => firebase.auth().signOut()}>
        Log out
      </Button>
    </Message.Header>
  </Message>
);

const SignIn = () => (
  <StyledFirebaseAuth
    uiConfig={uiConfig}
    firebaseAuth={firebase.auth()}
  />
);

const meetsPat = /^ *((?:M|Tu|W|Th|F)+) +(\d\d?):(\d\d) *[ -] *(\d\d?):(\d\d) *$/;

const timeParts = meets => {
  const [match, days, hh1, mm1, hh2, mm2] = meetsPat.exec(meets) || [];
  return !match ? {} : {
    days,
    hours: {
      start: hh1 * 60 + mm1 * 1,
      end: hh2 * 60 + mm2 * 1
    }
  };
};

const addCourseTimes = course => ({
  ...course,
  ...timeParts(course.meets)
});

const addScheduleTimes = schedule => ({
  title: schedule.title,
  courses: Object.values(schedule.courses).map(addCourseTimes)
});


const App = () => {
  const [schedule, setSchedule] = useState({ title: '', courses: [] });
  const [user, setUser] = useState(null);
  //const url = 'https://courses.cs.northwestern.edu/394/data/cs-courses.php';
  
  // calling useEffect(function) inside a component runs code in function in a controlled way
  // passing in an empty list as an argument runs the funciton in useEffect only when the component is first added 
  useEffect( ()=>{
    const handleData = snap => {
      if (snap.val()) setSchedule(addScheduleTimes(snap.val()));
    }
    db.on('value', handleData, error => alert(error));
    return () => { db.off('value', handleData); };
  }, []);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(setUser);
  }, []);

  return(
    <Container>
      <Banner title={schedule.title}/>
      <CourseList courses={ schedule.courses }/>
    </Container>
  );
};

export default App;
