Starting steps to the droplet ->
- firstly install nvm with this ```curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash```
- 2nd step is to refresh to have nvm working ```source ~/.bashrc  ```
- check the nvm version by ```nvm -v```
- Now its time to install node with nvm ```nvm install node```
- check node as well as npm version by ```node -v``` and ```npm -v```
- now generate ssh key to add in github repo so that we can pull the code from github directly ```ssh-keygen -t rsa -b 4096 -C "your_email@example.com"```
- after this copy the path in which public ssh key is stored and do ```cat <path>``` , after that copy the key and add it into github account
- Now we are good to take pull from github and push back. So clone the repo with ```git clone <ssh here>``` 
- now cd into the folder with ```cd <filder name>```
- install add the dependencies by ```npm i```
- create a .env file if using environment variables in the code with ```cat > .env``` , after this enter the contents of the file and after completion press ```ctrl+d``` to exit and save
- try running the app with ```node <main file name>```, if everything works then we are good to go
- now install *pm2* to run server in background 24x7 with ```npm i -g pm2```
- after that run ```pm2 start <mail file name>```, this will start the server in background and our server is up even if we clone the console. run ```pm2 stop <file name>``` to stop the server
- To start react-app or next-app with pm2 use `pm2 start npm -- start` , this command will run `npm start` with pm2
- Now if needed to run the server on a domain with ssl certificate, we need to install nginx and setup ssl certificate with certbot. 
- We start with installing nginx to our droplet with this command - ```sudo apt install nginx```
- Then we need to change the server firewall settings to allow https and ssh traffic on our server. Use ```sudo ufw app list``` to list down the rules. After that use  ```sudo ufw enable``` to enable the status.
- Now use ```sudo ufw allow 'Nginx HTTP'``` to allow HTTP traffic, later we will allow FULL with both HTTP and HTTPS included. For checking the firewall status we can use ```sudo ufw status```
- For checking the nginx server status, use ```systemctl status nginx```, make sure server is running
- And now we have successfully setup nginx on our machine. These are few commands to start,stop and restart nginx - ```sudo systemctl start nginx``` ```sudo systemctl stop nginx``` ```sudo systemctl restart nginx``` 
- Although our app is running but we can't access it with nginx right now and we will only see welcome to nginx page. So to make nginx redirect all the traffic to our nodejs app we need to setup a reverse proxy in nginx which will redirect all the traffic to out specified url.
- To do that we open the default file on the `/etc/nginx/sites-available/default` directory with nano command like this - ```sudo nano /etc/nginx/sites-available/default```, then edit this file under server->location add proxy_pass like this <code>

            location / {
             proxy_pass http://localhost:5000;
            }                           
    </code>
- Now lets start with our domain and ssl, use `sudo apt install certbot python3-certbot-nginx` to install certbot.
- After this edit the nginx config for ```/etc/nginx/sites-available/example.com```, this file will also be same as the default file just the difference will be that under server we will have this line - ```server_name example.com www.example.com;``` and rest everything will be same as in case of default file. so the code should look something like <code>
  
        server {
            listen 80 default_server;
            listen [::]:80 default_server;

            root /var/www/html;

            index index.html index.htm index.nginx-debian.html;

            server_name example.com www.example.com;

            location / {
                proxy_pass http://localhost:5000;
            }
        }
    </code>
- use ```sudo nginx -t``` to check for any errors in the configuration and if no errors were there, then simply reload nginx with ```sudo systemctl reload nginx```
- After this we will edit the firewall settings again with these 2 commands <code>
    sudo ufw allow 'Nginx Full'
    sudo ufw delete allow 'Nginx HTTP'
    </code>
- Just make sure we have the allowed `openssh` otherwise we will not be able to connect our droplet using ssh connection.
- After this get the ssl certificate by ```sudo certbot --nginx -d example.com -d www.example.com```
- And Wohoo we are all set and now our site should have a https connection and should be live on example.com
- But this ssl certificate is only valid upto 90 days so to schedule auto renewal use this command - ```sudo systemctl status certbot.timer```, after that if we want we can try a dry run with `sudo certbot renew --dry-run`
