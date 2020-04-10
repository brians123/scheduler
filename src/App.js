import React, { useState, useEffect } from 'react';
import 'rbx/index.css';
import { Button, Container, Title } from 'rbx';

// Banner component to display title
// destructuring syntax to get values we want from an object 
const Banner = ({title}) => (
  <Title>{title || '[loading...]' }</Title>
)

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
  courses: schedule.courses.map(addCourseTimes)
});

const Course = ({ course, state }) => (
  <Button color={ buttonColor(state.selected.includes(course)) }
    onClick={ () => state.toggle(course) }
    disabled={ hasConflict(course, state.selected )}>
    { getCourseTerm(course) } CS { getCourseNumber(course) } : { course.title }
  </Button>
)

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
  const url = 'https://courses.cs.northwestern.edu/394/data/cs-courses.php';
  
  // calling useEffect(function) inside a component runs code in function in a controlled way
  // passing in an empty list as an argument runs the funciton in useEffect only when the component is first added 
  useEffect( ()=>{
    const fetchSchedule = async () => {
      const response = await fetch(url);
      if (!response.ok) throw response; 
      const json = await response.json();
      setSchedule(addScheduleTimes(json));
    }
    fetchSchedule();
  }, []);

  return(
    <Container>
      <Banner title={schedule.title}/>
      <CourseList courses={ schedule.courses }/>
    </Container>
  );
};

export default App;
