FRESH DESTINATION — COMPLETE RESPONSIVE WEBSITE DESIGN PACK

DEVICES
- Desktop: 1600px wide
- Tablet: 1024px wide
- Smartphone: 390px wide

PNG FOLDERS
PNGs/desktop/
PNGs/tablet/
PNGs/mobile/

PAGES
01 Home: index.html
02 Australia: australia.html
03 Japan: japan.html
04 South Korea: korea.html
05 Airport Transfer - Trip Details: airport-transfer.html
06 Chauffeur by Day - Trip Details: chauffeur.html
07 Vehicle Selection: vehicle.html
08 Passenger Details: passenger.html
09 Checkout / Payment: checkout.html
10 Booking Received / Waiting for Provider: booking-received.html
11 Final Booking Confirmation: booking-confirmation.html
12 Provider Dashboard: provider-dashboard.html
13 Provider Job Review / Accept: provider-job.html
14 Provider Confirmed: provider-confirmed.html
15 Customer - Provider Confirmed: customer-provider-confirmed.html
16 Terms & Conditions: terms.html
17 Cancellation Policy: cancellation.html
18 About Us: about.html
19 Contact: contact.html

CURRENT SERVICE LOCATIONS
Australia: Sydney, Melbourne
Japan: Tokyo, Osaka
South Korea: Seoul, Busan, Jeju

VEHICLES
Do not show specific brands/models on the homepage.
Specific vehicle examples/models can be shown later in the booking flow and clarified in Terms & Conditions.

BUILD NOTE
The HTML/CSS files are responsive design references and can be used by a developer as the basis for a custom site or adapted into a Shopify theme. A booking platform of this type will require custom booking logic/app integration for availability, provider acceptance, payment, notifications, and booking status updates.

INTERACTIVE BOOKING (local implementation)
Home, Airport Transfer, Chauffeur, Vehicle, Passenger and Checkout now use booking.js.
Serve this directory with any static server or PHP, e.g.:
  php -S localhost:8080
Open http://localhost:8080/index.html.
Draft trip and passenger details are stored in sessionStorage for the current browser tab.
One Way / Return, date validation, country/city selection and capacity filtering are interactive.
Vehicle prices are indicative demo prices, not live provider quotes.
Checkout is a review-only draft: no booking submission, database, provider availability,
notifications or payment gateway is connected. No reservation or payment is created.
