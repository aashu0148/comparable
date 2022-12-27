# Comparable
## Scrape data from different website and compare the prices

- ## Backend  
    This folder contains main server which handle all the requests from frontend and does database manipulation when needed.
___
- ## consumer-basic
    This folder contains the 1st consumer server connected via messaging queue to the main server. This server handle the scrapping of website which can be done via api calls with or without use of any other npm packages
___
- ## consumer-medium
    This is the 2nd consumer server connected via messaging queue to the main server. It handles scraping of websites which do require more than a api call to allow access to them, i.e a browser like environment. Here i use puppeteer to mimic a chromium based browser environment. Websites like amazon, makeMyTrip, goibibo give better results on this server.
___
- ## consumer-heavy
    As the name suggests this handle heavy scraping operations(heavy because of the quantity of scraping operations). This is the 3rd and last consumer server connected via messaging queue to the main server. It handle offer scraping for a particular product in case of ecomerce comparison. 
___
- ## frontend 
    This contains old frontend code i.e, v1 of frontend
___
- ## frontend-v2 
    As the name suggests this contains the version 2 of frontend code which includes hotel comparison.
___
- ## newapp
    It is the mobile app made with react-native to support queue server and scrape the websites that block requests based on ip.
___
- ## queue-server
    it is custom message queue type DIY server, it has 3 lists (todo, ongoing, finished). 
    - todo -> all the requests that needs to be processed by the mobile app
    - ongoing -> requests that are being processed
    - finished -> requests that are done processing and are ready to be consumed by the owner.
___
- ## testing
    It's just simple testing folder where i do different type of testing for api and code that will later be added to any of above server folders.
___

.

# How does the backend servers work ? 

    Firstly the request goes from client to main server, then server identifies the request and send it for scraping to basic or medium or heavy consumers (based on the request). If the request os already processed in past 6 hours then main server also maintain a cache for 6 hours, then in such case it picks up the results from the cache and sends it to the finished queue connected to main server via messaging queues. 
    After this main server instantly respond the client with the expected platforms (from which client will be getting results) with a unique responseKey.
    Now let's first discuss about the finished queue. Well it is consumed on the main server itself. And whenever there is a new entry in that finished queue, its picked up by the main server and sent to the client via socket connection. That entry contains all the data of the request along with the results and responseKey so that the client identifies the request.
    For consumer-basic and consumer-medium both does scraping at their end and when they get results they just push those results in the finished queue which is consumed by the main server. If they require to scrape a platform that block request according to ip address, then they make a request to the queue-server with the url and a unique id for that url to add that in the todo list. While the mobile app is constantly making request to the queue-server in 8s interval asking for any url in todo to make a fetch call and whenever it gets the url it make a call to it and then submits the results back to the queue server which will be added to the finished list in the queue server. 
    Simultaneously the basic or medium server (whichever took help of the queue server to get results from IP blocking request) is constantly asking queue-server (with interval of 2-3s) if their url is done fetching or not. And when done fetching they do the same i.e, they take the results and push them to the finished queue which will be handle by the main server and eventually sent to the client. 
    The mobile app needs to be installed in 5-6 mobiles with good internet speed to handle a good amount of load.