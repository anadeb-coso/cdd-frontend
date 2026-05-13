# cdd-frontend

# Clone actually version
`git clone -b develop https://github.com/anadeb-coso/cdd-frontend.git`

# Install and run the app
1. Install a version greater than or equal to [JDK](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) 17
2. Install a version greater than or equal to [node](https://nodejs.org/fr/blog/release/v20.16.0) 20.16.0
3. Install Android Studio, VSCode or another editor you like (Recommendation : [Android Studio](https://developer.android.com/studio))
4. run `yarn install` to install the dependencies on the package.json file
5. run `yarn android` to run your app on your PC
6. Generate APK for test : `yarn android --mode release` or `.\gradlew assembleRelease`
7. Generate AAB for deployment : `npx react-native build-android --mode=release`. To see the file generated : `android/app/build/outputs/apk/release`

## Version
    - 17 (1.7.1)
        - Fix nullable problem on tache (id-19-Vérification de l'existence du CVD et de ses organes)
    - 18 (1.7.2)
        - Set server endpoint to "http://52.52.147.181/"
    - 19 (1.7.3)
        - Set server endpoint to "https://cddanadeb.e3grm.org/"
    - 20 (1.8.2) - 2023.07.27
        - Integration of task diagnostics and status
    - 21 (1.8.4) - 2023.07.27
        - Display CVD name on Phase, activty and task details page And update tasks search feature
    - 22 (1.8.5) - 2023.07.27
        - Update tasks search feature
    - 23 (1.8.6) - 2023.07.27
        - Update tasks search feature
    - 24 (1.9.0) - 2023.08.03
        - Setup a feature to sync falicilitator form datas to the couchdb
    - 25 (2.0.0) - 2024.01.29
        - Setup features to tracking subprojects, to allowing specialists to connect to the app for tracking subprojects and to allowing users to download apps
    - 26 (2.1.0) - 2024.02.23
        - Setup Support Material features
        - Updated fix map page closing problem
        - Updated some tracking subprojects pages
        - Decreased Images file during the loading
        - Fixed BigInt Bug
    - 28 (2.4.0) - 2024.04.24
        - Implementation of a sub-project tracking sub-module to record infrastructure details
        - Integration of a geographic coordinates module for villages and locations
        - Update of the sub-project tracking geographic coordinates page to allow the user to select the coordinates of pre-registered locations.
        - Small updates to sub-project tracking and other pages
    - 29 (2.4.1) - 2024.04.24
        - Add alert message to geolocation taking page (Message: Please make sure you are in the location before clicking on the location button.)
    - 30 (3.0.0) - 2024.08.07
        - Add Planning Feature
        - Check network availability before sync attachment on CDD cycle task form
        - Compress Image before upload attachment
        - Remove fences and latrine blocks questions and add latrine blocks numbers question under latrine blocks structure type
        - *Cancel local data storage and link the application directly to the remote database*
    - 31 (4.0.0) - 2024.08.08
        - Updated Expo project to Native project and adapted some files to the update
        - Add village progess to the project cycle page
        - Fix the display progress percent on the villages page
    - 32 (4.0.1) - 2024.08.11
        - Fix unsearching previous task
    - 33 (4.1.1) - 2024.09.02
        - Added News feature
    - 34 (4.7.1) - 2024.09.20
        - Fix and Update News feature
        - Update Instissment Cycle pages
        - Updated planning feature using Django Model instead of CouchDB doc
        - Include the possibility of using multiple Projects
    - 35 4.8.1 :
        - Set up possibility to use the database of another facilitator
        - Update planning feature to allow to Specialist to use it
        - Possibility to switch to another project
        - Page infos
    - 36 4.9.0 :
        - Precise number of invalidated tasks for villages, phases and activities
        - Status display (not started, in progress, completed, in validation, validated and invalidated) on tasks
        - Reduced image compression for clearer downloads
        - Changed GIS URL base
        - Filtering of CA tasks during diagnostics in the “Vos taches" module
    - 37 4.9.1 :
        - Resolving form registration problems
    - 38 4.9.9 :
        - Fix the displaying projects during the login
        - Add possibility to define dates interval
        - Add task example form
        - Alert users to activate their localization when taking coordinates (when they haven't yet activated localization)
    - 39 5.0.0 :
        - Added functionality for facilitators to report their presence in the field and collect coordinates of activity locations
        - Correction of file synchronization problems when recording site progress levels
        - Improved photo quality
    - 40 5.0.9 : 2025.02.10
        - Add passord changing and reset process
        - Increase user position around of initial position during the activity confirmation
        - Implementation of a constraint requiring the confirmation of the activity only for the relevant date.
    - 41 5.3.0 : 2025.04.05
        - Split data from multiple facilitators on each screen
        - Management of data retrieval processes on the server to avoid an infinite loop
    - 42 5.4.0 : 2025.04.20
        - Change field display and modalize selection fields
        - File selection restrictions depending on the file to be loaded
        - Delete test data from memory after test (TaskDetailTest)
        - Adding optional options to files/photos
        - Changes some warning Toasts to Modals
    - 43 5.5.0 : 2025.04.25
        - Navigation prevented when the application is out of date.
        - Update `tcomb-form-native` package
            - Updated use of modal elements by changing 'Picker' to 'Modal' react-native for Android version (Calendar display for dates)
            - Added ability to style Picker modal elements for IOS version 
            - Updated DatetimePicker to use 'react-native-modal-datetime-picker' datetime for Android
            - Updated text box to apply spaces when entering numbers
            - Customized display of multiline text entries
    - 44 5.5.2 : 2025.06.28
        - Copy the cantonal data common to all villages in a canton to the other villages belonging to the same canton
    - 45 5.6.0 : 2025.10.19
        - Integrate attendance number fields into planning
        - Highlight the difference between the labels of the main work and the secondary works
        - Provide the ability to log out on the project selection page
        - Reducing data to save in history
        - Displaying the application version in the Drawer
    - 46 5.6.1 : 2025.10.21
        - Accepting 0 in attendance fields in scheduling
    - 47 5.6.2 : 2025.10.22
        - Error saving task form
    - 48 5.7.0 : 2025.11.27
        - Review of geographic coordinate retrieval by finding the best location and resolving problems encountered during coordinate retrieval
        - Fixing issues with displaying AC villages in the "Village Geolocation" section
        - Display of tasks invalidated and reviewed by the facilitator
        - The retrieval of DCC data from facilitators db has been made smoother
        - To control and ensure user connectivity before certain requests are launched
        - Resolution of the problem of certain activities (planning) not being recorded when the user does not fill in the description field
        - Resolve the problem of priorities not being recorded in relation to the sub-project
    - 49 5.7.1 : 2026.01.25
        - Delete / download / view files directly from the mobile app (DCC form)
        - Change subdomain "cosomis-2.eba-mxictqba.us-west-1.elasticbeanstalk.com" to "sig.coso-togo.com" to apply secure https option
        - Change subdomain "cdd-env.eba-mz2nppu7.us-west-1.elasticbeanstalk.com" to "dcc.coso-togo.com" to apply secure https option
        - Change subdomain "grm-2-env.eba-speiyafz.us-west-1.elasticbeanstalk.com" to "mgp.coso-togo.com" to apply secure https option
    - 50 5.9.1 : 2026.02.06
        - Corrected TypeScript syntax and restructured the code
        - Displayed, zoomed, downloaded, and deleted files/photos from DCC cycle tasks
        - Displayed, zoomed, and downloaded files/photos from infrastructure data
        - Added the ability to select multiple photos of an infrastructure for synchronization
        - Reviewed the homepage
        - Review of the layout of the support materials page
    - 51 5.9.2 : 2026.03.04
        - Fixed the issue of PDF files not displaying in the gallery via the file field
    - 52 5.9.7 : 2026.05.06
        - Adapt the scheduling confirmation button (in the Scheduling module) to allow certain mobile phones to display this button
        - Restricting users' rights to actions on tracking progress levels, taking photos, deleting photos, taking geographic coordinates and entering data concerning the details of an infrastructure
        - Display of validation and invalidation comments on files (photos, documents) of the infrastructures with mention with colours on the files indicating whether they are validated or not, or which is the main file
    - 53 5.9.8 : 2026.05.13
        - Display under each canton, village, CVD, sub-project and work, the number of files (photos+documents) taken with invalid number
        - Using MAPBOX to display the coordinate point of an infrastructure under the "Geolocation" module


# Planning Feature

## Description
The Planning module on CDD app is a feature enabling community facilitators to plan their activities for the day. This planning enables their supervisors to monitor and have a general idea of the activities taking place in the field.

## Dev
### Structure
To implement this functionality, we have added two attributes `planning` which is a list of dictionaries each containing `planned_date`, `planned_datetime_start`, `planned_datetime_end`, `created_date` when created which may also have `completed`, `undo`, `is_another`, `is_free_task`, `another_detail`, `comment`, `photo_uri` and `updated_date` when modified (activity completion), and we've also added `planning_dates` which is a list containing planning dates.

***

1. `planned_date`: date on which the activity is planned
2. `planned_datetime_start`: date and time when the start of the activity is planned
3. `planned_datetime_end`: date and time when the end of the activity is planned
4. `created_date`: date and time when the activity is created
5. `completed`: This attribute is `true` if the activity has been completed and `false` if it has not
6. `undo`: This attribute is `true` if the activity has not been done, `null` or `false` if it has been done
7. `is_another`: This attribute is `true` if another activity has been done instead of the planned one
8. `is_free_task`: This attribute is `true` if the other activity done instead of the planned one is a FREE activity
9. `free_task_title`: Title of the FREE activity that was done instead of the planned one
10. `another_detail`: This attribute is a dictionary that contains the attributes `phase` (`name` and SQL `id` of the phase), `activity` (`name` and SQL `id` of the activity), `task_name` (name of the existing or free task) and `task_sql_id` (SQL id of the existing task, and is `null` when it is a FREE task). This attribute `another_detail` is defined only if another task was done instead of the planned one
11. `comment`: Description or comment about the activity that was done
12. `photo_uri`: Link to the photo of the completed activity. It is null when no photo has been attached
13. `updated_date`: date and time of the last update of the activity
14. `activity_validated_to_do`: This attribute is a dictionary that contains the attributes `by_supervisor` (`name`, `id` of zone supervisor and ``)


### Example 1
```
"planning": [
    {
      "planned_date": "2024-07-11",
      "planned_datetime_start": "2024-07-11T06:00:00.000Z",
      "planned_datetime_end": "2024-07-11T09:00:00.000Z",
      "created_date": "2024-07-17T17:19:58.784Z",
      "completed": null,
      "undo": true,
      "is_another": true,
      "is_free_task": true,
      "free_task_title": "another Task free",
      "another_detail": {
        "phase": {
          "name": "CLOTURE ET REPLANIFICATION DU SOUS-PROJET",
          "id": 9
        },
        "activity": {
          "name": "CLOTURE ET REPLANIFICATION DU SOUS-PROJET",
          "id": 9
        },
        "task_name": "another Task free",
        "task_sql_id": null
      },
      "comment": "Description",
      "photo_uri": "https://cddfiles.s3.amazonaws.com/proof_of_work/0dce78e6-ed62-4f88-8029-a4d960a7346a.jpg?AWSAccessKeyId=AKIAVNBI2LQUFQ6X2VPO&Signature=A1z97XMAoIi0ubAUKpxs8IHOXO8%3D&Expires=1721303272",
      "updated_date": "2024-07-18T10:48:11.725Z"
    }
  ],
  "planning_dates": [
    "2024-07-11"
]
```

### Example 2
```
  "planning": [
    {
      "planned_date": "2024-07-01",
      "planned_datetime_start": "2024-07-01T14:00:00.000Z",
      "planned_datetime_end": "2024-07-01T16:30:00.000Z",
      "created_date": "2024-07-15T11:48:02.882Z",
      "completed": true,
      "undo": null,
      "is_another": null,
      "is_free_task": null,
      "free_task_title": null,
      "comment": null,
      "photo_uri": "https://cddfiles.s3.amazonaws.com/proof_of_work/4ed8a26a-7d4d-4dcd-9f68-57e2f479ec25.jpg?AWSAccessKeyId=AKIAVNBI2LQUFQ6X2VPO&Signature=Spxqj2P5RsyOureH0nqBiSB8k0Y%3D&Expires=1721302926",
      "updated_date": "2024-07-18T10:42:09.611Z"
    },
    {
      "planned_date": "2024-07-15",
      "planned_datetime_start": "2024-07-15T10:00:00.000Z",
      "planned_datetime_end": "2024-07-15T12:30:00.000Z",
      "created_date": "2024-07-16T10:05:55.924Z"
    },
    {
      "planned_date": "2024-07-19",
      "planned_datetime_start": "2024-07-19T07:00:00.000Z",
      "planned_datetime_end": "2024-07-19T11:15:00.000Z",
      "created_date": "2024-07-18T15:44:17.254Z",
      "completed": true,
      "undo": false,
      "is_another": null,
      "is_free_task": null,
      "comment": "Le lorem ipsum est, en imprimerie, une suite de mots sans signification utilisée à titre provisoire pour calibrer une mise en page, le texte définitif venant remplacer le faux-texte dès qu'il est prêt ou que la mise en page est achevée. Généralement",
      "photo_uri": "https://cddfiles.s3.amazonaws.com/proof_of_work/14a4a51e-d2e5-464b-ae3b-e4edbdebb65e.jpg?AWSAccessKeyId=AKIAVNBI2LQUFQ6X2VPO&Signature=nYeywg9xfG7VLHSl5Y%2BZA5rtiRE%3D&Expires=1721321182",
      "updated_date": "2024-07-18T15:46:33.701Z"
    }
  ],
  "planning_dates": [
    "2024-07-01",
    "2024-07-15",
    "2024-07-19"
  ]
```


# Integrate with your tools

- [ ] [Set up project integrations](https://gitlab.com/ecube3/cdd-frontend/-/settings/integrations)

# Collaborate with your team

- [ ] [Invite team members and collaborators](https://docs.gitlab.com/ee/user/project/members/)
- [ ] [Create a new merge request](https://docs.gitlab.com/ee/user/project/merge_requests/creating_merge_requests.html)
- [ ] [Automatically close issues from merge requests](https://docs.gitlab.com/ee/user/project/issues/managing_issues.html#closing-issues-automatically)
- [ ] [Enable merge request approvals](https://docs.gitlab.com/ee/user/project/merge_requests/approvals/)
- [ ] [Automatically merge when pipeline succeeds](https://docs.gitlab.com/ee/user/project/merge_requests/merge_when_pipeline_succeeds.html)

# Test and Deploy

Use the built-in continuous integration in GitLab.

- [ ] [Get started with GitLab CI/CD](https://docs.gitlab.com/ee/ci/quick_start/index.html)
- [ ] [Analyze your code for known vulnerabilities with Static Application Security Testing(SAST)](https://docs.gitlab.com/ee/user/application_security/sast/)
- [ ] [Deploy to Kubernetes, Amazon EC2, or Amazon ECS using Auto Deploy](https://docs.gitlab.com/ee/topics/autodevops/requirements.html)
- [ ] [Use pull-based deployments for improved Kubernetes management](https://docs.gitlab.com/ee/user/clusters/agent/)
- [ ] [Set up protected environments](https://docs.gitlab.com/ee/ci/environments/protected_environments.html)

***
