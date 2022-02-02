import React from 'react';
import Card from './Card';

const List = () => {
  return <div  className='w-80 bg-white flex-1 flex flex-col gap-y-4 overflow-x-hidden overflow-y-auto h-full'>
      <Card />
      <Card />
      <Card />
      <Card />
      <Card />
  </div>;
};

export default List;
