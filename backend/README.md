Node.js backend for the CalendarPlanner webapp. 

startup with:
'''npm run dev'''

API defs:

/api/notes

    /list
        req: (year: int, month: int, day: int)
        res: (note_id: int, 
                user_id int,
                year int, \
                month int, \
                day int, \
                content varchar, \
                created_at date)
    
    /create
        req: (year: int, month: int, day: int, note: varchar)
        res: (response: varchar)

    /delete
        req: (note_id: int)
        res: (response: varchar)

/api/auth

    /login
        req: (username: varchar, password: varchar)
        res: (response: username:varchar, accesstoken:varchar) 
            refreshtoken: attached cookie

    /signup
        req: (username: varchar, password: varchar)
        res: (response: varchar)
    
    /logout
        req: (), credentials: include 
        res: (response: varchar)
    
    /refresh
        req: (), credentials: include 
        res: (accesstoken:varchar, username:varchar)

AuthN:

    Refresh tokens valid for 7 days. Cycled on refresh if last used more than 5 seconds ago. Resolved issue of re-mount which triggered back-to-back refresh calls. 

    To-do: implement process to clean cycled out refresh_tokens

PostGreSQL migrations:

npm run migrate:create create-notes     # creates migration
npm run migrate up                      # apply all pending migrations
npm run migrate down                    # roll back the most recent migration
npm run migrate redo                    # roll back, then roll up