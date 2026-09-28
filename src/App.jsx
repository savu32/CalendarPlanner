import './App.css'
import { Calendar } from './components/Calendar';
import { DateView } from './components/DateView';
import { Navigate } from 'react-router-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LogInView } from './components/LogInView';
import { SignUpView } from './components/SignUpView';

function App() {

  const today = new Date();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/calendar/" element={<Navigate to={`/calendar/${today.getFullYear()}/${today.getMonth()+1}`}/>} />
        <Route path="/calendar/:year/:month?/" element={<Calendar />} />
        <Route path="/calendar/:year/:month/:day" element={<DateView />} />
        <Route path="/calendar/login" element={<LogInView />} />
        <Route path="/calendar/signup" element={<SignUpView />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
