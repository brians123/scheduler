import React, { useState, useEffect } from 'react';
import 'rbx/index.css';
import { Button, Container, Title } from 'rbx';

// Banner component to display title
// destructuring syntax to get values we want from an object 
const Banner = ({title}) => (
  <Title>{title || '[loading...]' }</Title>
)

// CourseList component to map every course in courses object into its own HTML component
const CourseList = ({courses}) => (
  <Button.Group>
    { courses.map(course => <Course key={course.id} course={course}/>)}
  </Button.Group>
)

const terms = { F: 'Fall', W: 'Winter', S: 'Spring'};

// getting the first character of the course in course objects
const getCourseTerm = course => (
  terms[course.id.charAt(0)]
);

// getting the course number of the course in course objects
const getCourseNumber = course => (
  course.id.slice(1,4)
);

const Course = ({ course }) => (
  <Button>
    { getCourseTerm(course) } CS { getCourseNumber(course) } : { course.title }
  </Button>
)


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
      setSchedule(json);
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
