React frontend for the CalendarPlanner webapp. Uses ReactRouter to manage browser routes.

startup with:
'''npm run dev'''

Routes:

"/calendar/:year/:month" -> calendar month view:
Working homepage for the app. Allows users to increment/decrement month, log in, log out, and select a date.

"/calendar/:year/:month/:day" -> date view:
Contains an input field and previously submitted notes for that date. Each note displayed contains a delete button. New listNotes call is made from the page whenever note is created or deleted or page is refreshed.
To-do: caching, pagination, paginated queries

"/calendar/login" -> login page:
Contains return button, username/password fields, and signup button. 
To-do: notification banner

"/calendar/signup" -> signup page:
Contains return button and username/password fields. 
To-do: notification banner

AuthN/AuthZ:

Managed by AuthProvider which makes all calls to backend. RefreshToken cookie received and stored by browser on login. JWT AccessToken stored by AuthProvider. /refresh called after page reload or 401 response which cycles RefreshToken and provide new AccessToken. 