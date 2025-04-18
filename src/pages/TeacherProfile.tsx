import { useNavigate } from 'react-router-dom';

const TeacherProfile = () => {
  const navigate = useNavigate();
  const { bookSession } = useTeachers();

  const handleBookSession = async (sessionData: any) => {
    try {
      const booking = bookSession(sessionData);
      // Redirect to booking confirmation page
      navigate('/booking-confirmation');
    } catch (error) {
      console.error('Booking failed:', error);
      // Handle error
    }
  };

  // ... rest of the component code ...
}; 