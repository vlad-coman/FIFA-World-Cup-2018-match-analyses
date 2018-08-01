# FIFA-World-Cup-2018-match-analyses
RESTFUl Web App which provides match analyses from The 2018 FIFA World Cup. Administrators can add match analyses, while the rest of the users can view the articles, add comments, reply to other comments etc. To be an administrator you need a code from the owner of the site.

# Running App
https://enigmatic-woodland-49746.herokuapp.com

# Tehnologies used
<li>FRONTEND: HTML5, CSS3, JavaScript(ES6), Bootstrap</li>
<li>BACKEND: NodeJS, NPM, ExpressJS, Nodemailer, REST, PassportJS.</li>
<li>DATABASE: MongoDB</li>
<li>Remote Hosting on Heroku and MongoLab</li>

# Installation
> - <b>Register a <a href="https://www.google.com/gmail/about/#">Gmail</a> account to send the reset token for forgotten password</b></br>
> - <b>Register a <a href="https://cloudinary.com/">Cloudinary</a> account to use for hosting photos</b></br>

<b>Clone or download this repository:</b></br>
> - https://github.com/vlad-coman/FIFA-World-Cup-2018-match-analyses.git
</br>
<b>Download and install the following technologies:</b></br>
<ul>
  <li><a href="https://nodejs.org/en/download/">Node.js</a></li>
  <li><a href="https://www.mongodb.com/">MongoDB</a> - NoSQL database</li>
</ul>
<b>Move into World Cup 2018 Previews folder from the cloned repository</b>
<pre>cd World\ Cup\ 2018\ Previews/
</pre>
<b>Install all dependencies from package.json file like in the example below</b></br>
<pre>npm init</pre>
<pre>npm install express ejs dotenv ... --save</pre>
<p><b>Create a .env file where to put your enviroment variables(sensitive information). Those are accessed in code with process.env.VAR_NAME</b></p> 

<b>Run the app</b></br>
<pre>node app.js</pre>
<b>Go to:</b></br>
<pre>http://localhost:YOUR_PORT</pre>
