import './App.css'
import { Calendar } from './components/Calendar';
import { DateView } from './components/DateView';
import { Navigate } from 'react-router-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {

  const today = new Date();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/calendar/" element={<Navigate to={`/calendar/${today.getFullYear()}/${today.getMonth()+1}`}/>} />
        <Route path="/calendar/:year/:month?/" element={<Calendar />} />
        <Route path="/calendar/:year/:month/:day" element={<DateView />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
