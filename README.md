# pollefeys.dev
pollefeys.dev is my personal website where I can link my contact info and share more details or even host my projects.
## Home Page
This is where you can find all of my contact info as well as links to either other parts of my own website or other sites as well (such as Hypixel).
## LiveStats
LiveStats is my custom made Hypixel SkyWars Session Tracker. In short, it keeps track of your sessions with a lot of info that could be useful to grinders or players in general.
Any part of the session tracker can be collapsed or dragged above or below other parts of the website, giving you full freedom of what stats you want to have ready at all times.
![example](https://i.imgur.com/oCRlRVX.png)
(keep in mind the website is constantly updated and this image is just an example of how it looked during a real session for Virmah, a few updates ago)
### Header
The header shows the user the name of the website at first. When you've successfully used an API key to start a session, the title will change and include your name as well as your MC playerhead. Below that it will now show the size of the whitelist for as long as it exists.
### API Form
To use the website, your API key is needed. The key also needs to be whitelisted by me with an MD5 hashed version of your key. It will show that you aren't whitelisted if you're not and start a session if you are upon pressing the Submit button.
### Session
The main core of the session tracker are of course the main session stats, found in the 'session' tab. These includes stats like wins or kills but also shards and heads. Behind these stats you can also find how much of the stat you have gained that session alone. There's also a clock to keep track of time and some progress bars that allow you to see your progress towards your next opal or level at any given time.
### Game History
In this tab you can find a bit more info about individual games you've had this session. You can find a summary of your last game as well as a grid that includes every game you've played this session. Every game is color coded red or green for victory, has a purple border of corrupted and shows the kills you got in it.
### Current Map
The current map is a premade map image that is loaded in based on which map the API detects you on. It shows where chests, anvils, enchantment tables and player spawns are. This can all be helpful to see while playing the game, but is purely static once loaded.
