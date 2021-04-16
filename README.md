# music_visualizer
CS506 music visualizer group project

To run the project please have Angular and Angular CLI installed on your local machine.
Clone the repo, navigate to music_visualizer/music-visualizer

- Run npm install -s
- Run ng serve --ssl true --ssl-cert ./src/server.crt --ssl-key ./src/server.key

This will load the application, go to the localhost address your console provides in Google Chrome.
Upon page load, click sign up, create an account, and you will be redirected to an introduction page.

From there click continue to visualization page.

To visualize a song, choose a source of the three presented on the screen.
After successful file upload/spotify connection/microphone access, the visualization should begin animating on screen.
Clicking m again will hide the menu. 

To run code coverage, run:
ng test --code-coverage

Live deployment link:
 https://music-visualizer-b2ae6.web.app/
