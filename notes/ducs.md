# `du -cs`: Unofficial website of DUCS

Dec 20, 2017

In an effort to involve students of DUCS (Dept. of Computer Science, University of Delhi) in web development and GitHub, I created an website for my college - [https://www.ducs.in/][2]. The website is open-source and students collaboratively edit it's content.

![du -cs](https://user-images.githubusercontent.com/8426945/62230226-fff70080-b3de-11e9-8c85-91b9ab523c94.png)

The website (at the time of writing) hosts Sankalan (annual tech fest of DUCS) and Srijan (annual magazine of DUCS). During Sankalan, we used - https://dashboard.ducs.in (deleted now to save server costs) to handle its ticketing system, quiz portals and admin interface.

I later plan to inlcude an alumni network and placement related information on this website, ofcourse, with an open development environment.

## Techinal Details

The main website - https://www.ducs.in/ is a static website. Now creating a static website isn't a very tough task, but maintaining a static website is. So in order to simplify maintanence part, I used a custom built static website generator using Gulp.js and some npm scripts. For templating I used Pug.js and the data was stored in .yaml files to allow easy editing.

The site is hosted in three AWS S3 buckets (two for website - www and non-www and one for assets cdn). The buckets are accessed through two separate Cloudfront distributions. In order leverage strong HTTP caching, I converted static assets names to the checksums of their content. The cache is busted when the content changes.

As S3 buckets do not allow easy access to pretty URLs, I made use of a tiny AWS Lambda @Edge function that makes sure users don't see 404s if they forgot to add a slash in URL.

The SSL certificate on website is from AWS ACM.

The dashboard website was built in PHP and hosted on an AWS EC2 instance with a load balancer in front of it. The MySQL database was hosted on AWS RDS.

For the dashboard, I created my own framework on top on Symfony's HTTP foundation module. All requests are passed to a front-controller which processes those requests.

To ease deployments, I made use of git and some shell scripting. Git was used so that I only upload the files that have changed (I've really slow internet).

This project taught me a lot about AWS and SSH. It also connected some students to GitHub (as they updated the content of website)

[1]: https://github.com/sidvishnoi/ducs.in
[2]: https://www.ducs.in/
