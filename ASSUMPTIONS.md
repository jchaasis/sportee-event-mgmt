
## Document purpose
This file contains assorted assumptions that were made during the development of the project.

Normally, I would ask/discuss these topics with other members of the team (product, design, fellow engineers, etc.).

Given the nature of this challenge, I decided to document the questions/topics/etc. here.

## Assumptions
__Question:__ Should users see _ALL_ available events, or just the ones they created? <br>
__Answer:__ No. They should only have access to events they created. I did take this one step further by creating an Organization entity, so that this app would support multi-tenancy. However, I realize that was scope creep so I didn't incorporate that in the UI.

__Question:__ Should sport types be static, or dynamic based on user? <br>
__Answer:__ I think it would make sense to have configurability, however I kept them static for the sake of this challenge.

__Question:__ Should events use a date range? With a start and end date?
__Answer:__ This feels like it would be nice to have, however for the sake of the challenge I am going with a single date on Events

__Question:__ The requirements document very clearly states that we should use the shadcn `Form` component. However, the docs state that it is no longer under active development and they recommend using the `Field` component. Why MUST we use this?
__Answer:__ No idea. I'm guessing it is the standard across the code base. I will use it because it is set as a requirement, however I'm not happy about it! I've had deprecated components bite me in the past...

__Assumption:__ In regards to authentication - Users should certanily confirm their email before being allowed to access this product. For the sake of simplicity for this challenge, I'm not going to enable that feature in Supabase.

__Assumption:__ Nobody is going to read this assumption file.

__Assumption:__ We would want some pagination on the Dashboard page at some point. I'm not going to add it for the sake of this challenge.



