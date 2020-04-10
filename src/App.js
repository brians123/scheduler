import React, { useState, useEffect } from 'react';
import 'rbx/index.css';
import { Button, Container, Title, Message } from 'rbx';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

const firebaseConfig = {
  apiKey: "AIzaSyDA-37vp1Ibf5E9ktraiYIZQp-llDFS0Y8",
  authDomain: "schedulerdb-33c8c.firebaseapp.com",
  databaseURL: "https://schedulerdb-33c8c.firebaseio.com",
  projectId: "schedulerdb-33c8c",
  storageBucket: "schedulerdb-33c8c.appspot.com",
  messagingSenderId: "295643298502",
  appId: "1:295643298502:web:8881da3091a42bc36835c7"
};

const uiConfig = {
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: () => false
  }
};

firebase.initializeApp(firebaseConfig);
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

const buttonColor = selected => (
  // color is set to success green if it is selected
  selected ? 'success' : null
);

const terms = { F: 'Fall', W: 'Winter', S: 'Spring'};

const TermSelector = ({ state }) => (
  // add hasAddons prop from rbx to have the buttons be connected 
  <Button.Group hasAddons> 
    { Object.values(terms).map(value => // Object.values(terms) gets all the values of terms global variable
      <Button key={value}
        color = { buttonColor(value===state.term) }
        onClick = { () => state.setTerm(value) }
        >
        {value}
      </Button>
      )
    }
  </Button.Group>
)

const useSelection = () =>{
  const [selected, setSelected] = useState([]);
  const toggle = (x) => {
    setSelected(selected.includes(x) ? selected.filter(y=> y!==x) : [x].concat(selected))
  };
  return [selected, toggle];
}

// CourseList component to map every course in courses object into its own HTML component
const CourseList = ({ courses }) =>{
  const [term, setTerm] = useState('Fall'); // initialize state to fall term
  const [selected, toggle] = useSelection();
  const termCourses = courses.filter(course => term === getCourseTerm(course)); // filter courses by term

  // pass in term as props to TermSelector
  // state={ {term, setTerm}} is same as { term: term, setTerm: setTerm }
  return(
  <React.Fragment>
    <TermSelector state={ {term, setTerm}}/> 
    <Button.Group>
      { termCourses.map(course => <Course key={ course.id } course={ course } state= { {selected, toggle} } /> )}
    </Button.Group>
  </React.Fragment>
  );
};

// getting the first character of the course in course objects
const getCourseTerm = course => (
  terms[course.id.charAt(0)]
);

// getting the course number of the course in course objects
const getCourseNumber = course => (
  course.id.slice(1,4)
);

const hasConflict = (course,selected) => (
  selected.some(selection=>courseConflict(course,selection))
);

const days = ['M', 'Tu', 'W', 'Th', 'F'];

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

const Course = ({ course, state, user }) => (
  <Button color={ buttonColor(state.selected.includes(course)) }
    onClick={ () => state.toggle(course) }
    onDoubleClick={ user ? () => moveCourse(course) : null }
    disabled={ hasConflict(course, state.selected )}>
    { getCourseTerm(course) } CS { getCourseNumber(course) } : { course.title }
  </Button>
)

const moveCourse = course => {
  const meets = prompt('Enter new meeting data, in this format:', course.meets);
  if (!meets) return;
  const {days} = timeParts(meets);
  if (days) saveCourse(course, meets); 
  else moveCourse(course);
};

const saveCourse = (course, meets) => {
  db.child('courses').child(course.id).update({meets})
    .catch(error => alert(error));
};

const daysOverlap = (days1, days2) => (
  days.some(day => days1.includes(day) && days2.includes(day))
);

const hoursOverlap = (hours1, hours2) => (
  Math.max(hours1.start, hours2.start) < Math.min(hours1.end, hours2.end)
);

const timeConflict = (course1, course2) => (
  daysOverlap(course1.days, course2.days) && hoursOverlap(course1.hours, course2.hours)
);

const courseConflict = (course1, course2) => (
  course1 !== course2
  && getCourseTerm(course1) === getCourseTerm(course2)
  && timeConflict(course1, course2)
);


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
