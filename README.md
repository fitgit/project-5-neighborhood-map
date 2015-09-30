# Project5-neighborhood-map(Restaurants googler-Middletown,NJ)
## To run the project,
1. Click on the index.html. This should load the google map, centering Middletown,NJ and brings up the static restaurants in the model with a marker on each one of them.
2. Clicking on the Marker, should open an infoWindow, with the address and phone number of the restaurant along with the url.
3. Clicking on the URL should open up another tab/window with the redirected restaurant info.
4. Clicking on the Marker, changes the marker color to green, with a bounce animation for a few seconds. On closing the infoWindow the marker changes back to red, the original color.
5. In case of a failure to get API(foursquare) data, A "Content could not be loaded" msg is displayed.
6. In case relevant data not found like address,phone number or url, appropriate msg is displayed.

## List View
1. On selecting the search box, all the choices for filtering should be displayed. Which are currently on the name of the restaurants.
2. On entering a fuzzy search value, appropriate restaurant names should be displayed.

   ex: on entering the letter "e" all names having the letter "e" should be displayed.
3. Clicking on the appropriate name from the list view, should open an infoWindow with name,address,phone number and url.       Clicking on the url should open a new/window tab with the redericted url.
