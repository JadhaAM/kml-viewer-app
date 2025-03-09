# KML File Viewer

## Overview
This project is a simple **React-based webpage** that allows users to **upload and read KML files**. It provides:
- A **summary** of different element types in the KML file.
- A **detailed** breakdown including element types and total lengths (for lines).
- A **map integration** to visualize the parsed KML data using **Leaflet.js** or another mapping library.

## Features
✅ **Upload KML File** – Allows users to upload a `.kml` file.  
✅ **Summary View** – Displays the count of different KML element types.  
✅ **Detailed View** – Shows element type and total length (for LineStrings/MultiLineStrings).  
✅ **Map Integration** – Renders KML elements on an interactive map using **OpenStreetMap / Google Maps / Leaflet.js**.  

## Installation & Setup
### Prerequisites
Ensure you have **Node.js** and **npm** installed.

### Clone Repository
```bash
git clone https://github.com/your-repo/kml-file-viewer.git
cd kml-file-viewer
```

### Install Dependencies
```bash
npm install
```

### Run the Application
```bash
npm start
```

This will start the development server, and you can access the app at:  
`http://localhost:3000`

## Usage
1. **Upload a KML file** (e.g., `test-data.kml`).
2. Click the **Summary** button to view element counts.
3. Click the **Detailed** button to see types and lengths.
4. The map will display the uploaded KML data.

## Sample KML File
You can use the following **test-data.kml** file for testing:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Test KML Data</name>
    <Placemark>
      <name>Point 1</name>
      <Point>
        <coordinates>78.9629,20.5937,0</coordinates>
      </Point>
    </Placemark>
    <Placemark>
      <name>Test Line</name>
      <LineString>
        <coordinates>
          78.9629,20.5937,0
          77.1025,28.7041,0
          75.7873,26.9124,0
        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>
```
Save this as `test-data.kml` and upload it to test the functionality.

## Technologies Used
- **React.js** – Frontend framework
- **Leaflet.js** – For map integration
- **JSX & JavaScript** – Parsing and rendering KML data
- **GeoJSON & XML Parsing** – Handling KML data

## Future Enhancements
🔹 Improve UI design with TailwindCSS or Material-UI.  
🔹 Add support for GPX and GeoJSON formats.  
🔹 Enable real-time coordinate calculations for advanced analytics.  

## License
This project is **open-source** and available under the [MIT License](LICENSE).

---
**Happy Coding! 🚀**

