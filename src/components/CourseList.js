import React, { useState } from 'react';
import 'rbx/index.css';
import { Button } from 'rbx';
import Course from './Course';

const useSelection = () =>{
    const [selected, setSelected] = useState([]);
    const toggle = (x) => {
      setSelected(selected.includes(x) ? selected.filter(y=> y!==x) : [x].concat(selected))
    };
    return [selected, toggle];
  }

const terms = { F: 'Fall', W: 'Winter', S: 'Spring'};
const buttonColor = selected => (
    // color is set to success green if it is selected
    selected ? 'success' : null
  );

// getting the first character of the course in course objects
const getCourseTerm = course => (
    terms[course.id.charAt(0)]
  );

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
  

export default CourseList;