# swissBot
To add a plugin write a js script that export these two functions:   
  help() which returns a help string  
  exec(errorCodes,message, log, postMessage) which executes the command.
  * errorCodes contains errorCodes you need to use in case of not_handling and parsing errors.   
  *  message is the user message in the form of array.  
  * log is a method to log, it automatically adds the plugin name.   
  * postMessage posts the argument it gets to slack (by default it only prints to log, in production it actually posts).  

a very simple example is the echo plugin. just copy it and go from there.

# help
[de]register [meeting/agenda]
(remindersPlugin)

meeting
agenda
agenda tomorrow
(meetingPlugin)

echo <message>
(echoPlugin)

room [buliding] - Find a room in requested building or in default building:IDC11
(roomPlugin)


feeder <task name pattern> - Return most recent task that answers pattern
(feeder)

build <task name>
(jenkinsBuildPlugin)
