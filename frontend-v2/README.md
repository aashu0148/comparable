# Comparable Frontend v2
 
This repository contains frontend code for Comparable in next.js
## Start Server

1.  Add <b>.env</b> file according to the <b>.env.example</b> file.

2.  Installing dependencies
    ```
    npm i
    ```
3.  Start the application
    ```
    npm run dev
    ```

## Some conventions we should follow

1. Use import structure like : `Library imports` -> `component/layout imports` -> `utility/api/asset imports` -> `css imports` separated by new lines.

2. Use defined variables in css instead of direct color values, also use `text variables` for giving color to texts and `background color` for giving color to background.

3. Components to be used more than once should be put inside `components` folder.

4. All the `apis` must be very much independent and should only have the task to make request and return corresponding response.

5. styles needed in more than 3-4 places should have a `global class` in `styles/global.scss` for ease.

6. Do not use `../` anywhere while dealing with paths instead use absolute path pointing to root directory. ex: `../../styles/global.module.scss` to `styles/global.module.scss`

7. All the functions to be used more than twice should go under `utils/util.js` 