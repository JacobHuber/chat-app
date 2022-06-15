## Socket.IO Chat App

This chat app is an extension of <https://socket.io/get-started/chat/>

<img src="https://user-images.githubusercontent.com/16791782/173892855-5c3760bd-e204-4a64-aa7e-ef126f4b9e81.png" width="600px"/>



### Installation

To install this app, run the command

    npm install
    
in the directory containing these files.

### Running

To run the chat app server use the command
    
    node index.js <port number>
    
where **\<port number\>** is the port that you want the server to run on.

### Commands

There are two commands that a user can use.

#### /name Command
This command will change the user's name.

    /name [newName]

example:

    /name Jacob Huber
This will change the user's name to "Jacob Huber"

#### /color Command
This command will change the user's color.

    /color [hexColor]

example:

    /color FF0000
This will change the color of the user's name to red.
