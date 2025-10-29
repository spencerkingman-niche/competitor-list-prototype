import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import './MapView.css'

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Create custom colored icons
const createColoredIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-wrapper">
        <div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>
        <div class="marker-label">${label}</div>
      </div>
    `,
    iconSize: [25, 25],
    iconAnchor: [12, 24],
  })
}

// Create custom icon for base college (University of Tulsa)
const baseCollegeIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div class="marker-wrapper">
      <div style="background-color: #009266; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 4px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.4);"></div>
      <div class="marker-label marker-label-base">University of Tulsa</div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

// Accent colors for different competitor sets
const accentColors = ['#FB5A00', '#FF9B00', '#835000', '#FF90E7', '#8CA6FF']

// Component to fit map bounds to markers
function FitBounds({ colleges, baseCollege }: { colleges: CollegeLocation[], baseCollege: CollegeLocation }) {
  const map = useMap()

  useEffect(() => {
    if (colleges.length === 0) return

    // Create bounds including base college and all filtered colleges
    const allLocations = [baseCollege, ...colleges]
    const bounds = L.latLngBounds(
      allLocations.map(loc => [loc.lat, loc.lng] as [number, number])
    )

    // Fit the map to these bounds with some padding
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 })
  }, [colleges, baseCollege, map])

  return null
}

interface CompetitorDataRow {
  Category?: string;
  Description?: string;
  Rank?: string;
  'School Name'?: string;
  'Similarity Score'?: string;
  State?: string;
  Type?: string;
  Religion?: string;
  'Acceptance Rate'?: string;
  'Niche Grade'?: string;
}

interface CollegeLocation {
  name: string;
  lat: number;
  lng: number;
  state: string;
}

function MapView() {
  const [competitorData, setCompetitorData] = useState<CompetitorDataRow[]>([])
  const [selectedCollege, setSelectedCollege] = useState<CollegeLocation | null>(null)
  const [mapCenter] = useState<[number, number]>([36.1539, -95.9436]) // Center on Tulsa
  const [selectedFilter, setSelectedFilter] = useState<string>('')
  const [availableFilters, setAvailableFilters] = useState<string[]>([])
  const [removedSchools, setRemovedSchools] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [addedSchools, setAddedSchools] = useState<Set<string>>(new Set())

  // College location for University of Tulsa
  const baseCollege: CollegeLocation = {
    name: "The University of Tulsa",
    lat: 36.1539,
    lng: -95.9436,
    state: "Oklahoma"
  }

  useEffect(() => {
    // Load competitor data from CSV
    loadCompetitorData()
  }, [])

  const loadCompetitorData = async () => {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}university-of-tulsa-data.csv`)
      const csvText = await response.text()
      const data = parseCSV(csvText)
      
      // All rows are already University of Tulsa data
      setCompetitorData(data)
      
      // Extract unique competitor categories and sort by average similarity score
      const categoryScores = new Map<string, number[]>()
      
      data.forEach(row => {
        if (row.Category && row['Similarity Score']) {
          if (!categoryScores.has(row.Category)) {
            categoryScores.set(row.Category, [])
          }
          categoryScores.get(row.Category)!.push(parseFloat(row['Similarity Score']))
        }
      })
      
      // Calculate average similarity score for each category and sort
      const categoriesWithAvg = Array.from(categoryScores.entries()).map(([category, scores]) => ({
        category,
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length
      }))
      
      const sortedCategories = categoriesWithAvg
        .sort((a, b) => b.avgScore - a.avgScore) // Sort descending by similarity
        .map(item => item.category)
      
      setAvailableFilters(sortedCategories)
      
      // Set the first category as the default selected filter
      if (sortedCategories.length > 0) {
        setSelectedFilter(sortedCategories[0])
      }
      
    } catch (error) {
      console.error('Error loading competitor data:', error)
      setCompetitorData([])
    }
  }

  // Comprehensive competitor college locations
  const competitorLocations: { [key: string]: CollegeLocation } = {
    // Regional Powerhouses
    "University of Oklahoma": { name: "University of Oklahoma", lat: 35.2058, lng: -97.4458, state: "Oklahoma" },
    "Oklahoma State University": { name: "Oklahoma State University", lat: 36.1156, lng: -97.0584, state: "Oklahoma" },
    "Texas Christian University": { name: "Texas Christian University", lat: 32.7096, lng: -97.3681, state: "Texas" },
    "Southern Methodist University": { name: "Southern Methodist University", lat: 32.8412, lng: -96.7845, state: "Texas" },
    "University of Arkansas": { name: "University of Arkansas", lat: 36.0686, lng: -94.1748, state: "Arkansas" },
    "Tulane University": { name: "Tulane University", lat: 29.9395, lng: -90.1203, state: "Louisiana" },
    "Texas A&M University": { name: "Texas A&M University", lat: 30.6187, lng: -96.3365, state: "Texas" },
    "Baylor University": { name: "Baylor University", lat: 31.5497, lng: -97.1143, state: "Texas" },
    "Rice University": { name: "Rice University", lat: 29.7174, lng: -95.4018, state: "Texas" },
    "University of Texas - Austin": { name: "University of Texas - Austin", lat: 30.2849, lng: -97.7341, state: "Texas" },
    
    // Faith-Based Alternatives
    "Oral Roberts University": { name: "Oral Roberts University", lat: 36.0373, lng: -95.9145, state: "Oklahoma" },
    "Abilene Christian University": { name: "Abilene Christian University", lat: 32.4587, lng: -99.7373, state: "Texas" },
    "Houston Christian University": { name: "Houston Christian University", lat: 29.7177, lng: -95.4990, state: "Texas" },
    "Oklahoma Baptist University": { name: "Oklahoma Baptist University", lat: 34.7847, lng: -96.9281, state: "Oklahoma" },
    "Oklahoma Christian University": { name: "Oklahoma Christian University", lat: 35.6595, lng: -97.4714, state: "Oklahoma" },
    "Oklahoma City University": { name: "Oklahoma City University", lat: 35.5186, lng: -97.5303, state: "Oklahoma" },
    "Ouachita Baptist University": { name: "Ouachita Baptist University", lat: 34.2321, lng: -93.0665, state: "Arkansas" },
    
    // Elite National Universities
    "Wheaton College - Illinois": { name: "Wheaton College - Illinois", lat: 41.8625, lng: -88.1070, state: "Illinois" },
    "Washington University in St. Louis": { name: "Washington University in St. Louis", lat: 38.6488, lng: -90.3108, state: "Missouri" },
    "Grinnell College": { name: "Grinnell College", lat: 41.7450, lng: -92.7213, state: "Iowa" },
    "University of Chicago": { name: "University of Chicago", lat: 41.7886, lng: -87.5987, state: "Illinois" },
    "Vanderbilt University": { name: "Vanderbilt University", lat: 36.1447, lng: -86.8027, state: "Tennessee" },
    "Case Western Reserve University": { name: "Case Western Reserve University", lat: 41.5045, lng: -81.6082, state: "Ohio" },
    "University of Notre Dame": { name: "University of Notre Dame", lat: 41.7036, lng: -86.2388, state: "Indiana" },
    "Davidson College": { name: "Davidson College", lat: 35.5007, lng: -80.8468, state: "North Carolina" },
    "Duke University": { name: "Duke University", lat: 36.0014, lng: -78.9382, state: "North Carolina" },
    
    // In-State Access Points
    "University of Central Oklahoma": { name: "University of Central Oklahoma", lat: 35.6573, lng: -97.4719, state: "Oklahoma" },
    "Northeastern State University": { name: "Northeastern State University", lat: 36.0548, lng: -94.8858, state: "Oklahoma" },
    "Rogers State University": { name: "Rogers State University", lat: 36.3742, lng: -95.6019, state: "Oklahoma" },
    "Oklahoma State University - Oklahoma City": { name: "Oklahoma State University - Oklahoma City", lat: 35.5308, lng: -97.5303, state: "Oklahoma" },
    "East Central University": { name: "East Central University", lat: 34.8678, lng: -96.7728, state: "Oklahoma" },
    "Southwestern Oklahoma State University": { name: "Southwestern Oklahoma State University", lat: 35.5222, lng: -99.3870, state: "Oklahoma" },
    "Southeastern Oklahoma State University": { name: "Southeastern Oklahoma State University", lat: 34.0399, lng: -96.6714, state: "Oklahoma" },
    "Northwestern Oklahoma State University": { name: "Northwestern Oklahoma State University", lat: 36.7378, lng: -98.8637, state: "Oklahoma" },
    
    // Selective Private Competitors
    "Trinity University": { name: "Trinity University", lat: 29.4577, lng: -98.4888, state: "Texas" },
    "Austin College": { name: "Austin College", lat: 33.6151, lng: -96.5972, state: "Texas" },
    "Hendrix College": { name: "Hendrix College", lat: 35.0984, lng: -92.4407, state: "Arkansas" },
    "Saint Louis University": { name: "Saint Louis University", lat: 38.6355, lng: -90.2350, state: "Missouri" },
    "Colorado School of Mines": { name: "Colorado School of Mines", lat: 39.7508, lng: -105.2210, state: "Colorado" },

    // Additional potential competitors (not in current data)
    "University of Kansas": { name: "University of Kansas", lat: 38.9543, lng: -95.2558, state: "Kansas" },
    "Kansas State University": { name: "Kansas State University", lat: 39.1911, lng: -96.5776, state: "Kansas" },
    "University of Missouri": { name: "University of Missouri", lat: 38.9404, lng: -92.3277, state: "Missouri" },
    "Missouri State University": { name: "Missouri State University", lat: 37.1954, lng: -93.2903, state: "Missouri" },
    "University of Denver": { name: "University of Denver", lat: 39.6779, lng: -104.9619, state: "Colorado" },
    "Creighton University": { name: "Creighton University", lat: 41.2619, lng: -95.9450, state: "Nebraska" },
    "Butler University": { name: "Butler University", lat: 39.8403, lng: -86.1686, state: "Indiana" },
    "Drake University": { name: "Drake University", lat: 41.6005, lng: -93.6539, state: "Iowa" },
    "DePaul University": { name: "DePaul University", lat: 41.9247, lng: -87.6534, state: "Illinois" },
    "Marquette University": { name: "Marquette University", lat: 43.0389, lng: -87.9288, state: "Wisconsin" },
    "Loyola University Chicago": { name: "Loyola University Chicago", lat: 41.9988, lng: -87.6594, state: "Illinois" },
    "Xavier University": { name: "Xavier University", lat: 39.1486, lng: -84.4746, state: "Ohio" },
    "University of Dayton": { name: "University of Dayton", lat: 39.7400, lng: -84.1779, state: "Ohio" },
    "Elon University": { name: "Elon University", lat: 36.1026, lng: -79.5058, state: "North Carolina" },
    "Furman University": { name: "Furman University", lat: 34.9242, lng: -82.4397, state: "South Carolina" },
    "Rhodes College": { name: "Rhodes College", lat: 35.1495, lng: -90.0052, state: "Tennessee" },
    "Sewanee: The University of the South": { name: "Sewanee: The University of the South", lat: 35.2025, lng: -85.9203, state: "Tennessee" },
    "Samford University": { name: "Samford University", lat: 33.4655, lng: -86.7946, state: "Alabama" },
    "Belmont University": { name: "Belmont University", lat: 36.1365, lng: -86.7967, state: "Tennessee" },
    "Texas Tech University": { name: "Texas Tech University", lat: 33.5843, lng: -101.8759, state: "Texas" },
    "University of North Texas": { name: "University of North Texas", lat: 33.2073, lng: -97.1526, state: "Texas" },
    "Texas State University": { name: "Texas State University", lat: 29.8886, lng: -97.9391, state: "Texas" },
    "University of Houston": { name: "University of Houston", lat: 29.7199, lng: -95.3422, state: "Texas" },
    "Louisiana State University": { name: "Louisiana State University", lat: 30.4133, lng: -91.1800, state: "Louisiana" },
    "University of Mississippi": { name: "University of Mississippi", lat: 34.3665, lng: -89.5348, state: "Mississippi" },
    "Mississippi State University": { name: "Mississippi State University", lat: 33.4557, lng: -88.7918, state: "Mississippi" },
    "University of Alabama": { name: "University of Alabama", lat: 33.2098, lng: -87.5692, state: "Alabama" },
    "Auburn University": { name: "Auburn University", lat: 32.6010, lng: -85.4883, state: "Alabama" },
    "University of Kentucky": { name: "University of Kentucky", lat: 38.0297, lng: -84.5037, state: "Kentucky" }
  }

  const getFilteredCompetitors = (): CollegeLocation[] => {
    let competitors: CollegeLocation[] = []
    
    if (selectedFilter === 'all') {
      // Return all unique competitors
      const uniqueCompetitors = Array.from(new Set(
        competitorData.map(row => row['School Name']).filter(Boolean)
      ))
      competitors = uniqueCompetitors
        .filter(name => !removedSchools.has(name!))
        .map(name => competitorLocations[name!])
        .filter(Boolean)
    } else {
      // Filter by selected competitor category
      const filteredData = competitorData.filter(
        row => row.Category === selectedFilter
      )
      const uniqueCompetitors = Array.from(new Set(
        filteredData.map(row => row['School Name']).filter(Boolean)
      ))
      competitors = uniqueCompetitors
        .filter(name => !removedSchools.has(name!))
        .map(name => competitorLocations[name!])
        .filter(Boolean)
    }
    
    // Add manually added schools for this category
    const addedForCategory = Array.from(addedSchools)
      .filter(name => !removedSchools.has(name))
      .map(name => competitorLocations[name])
      .filter(Boolean)
    
    return [...competitors, ...addedForCategory]
  }

  const getMarkerColor = (): string => {
    if (selectedFilter === 'all') {
      return accentColors[0] // Default color for "all"
    }
    // Assign colors based on filter index
    const filterIndex = availableFilters.indexOf(selectedFilter)
    return accentColors[filterIndex % accentColors.length]
  }

  const filteredColleges = getFilteredCompetitors()
  const markerColor = getMarkerColor()

  const parseCSV = (csvText: string): CompetitorDataRow[] => {
    const lines = csvText.split('\n')
    const headers = lines[0].split(',')
    return lines.slice(1).map(line => {
      const values = line.split(',')
      return headers.reduce((obj: CompetitorDataRow, header: string, index: number) => {
        obj[header as keyof CompetitorDataRow] = values[index]
        return obj
      }, {} as CompetitorDataRow)
    })
  }

  const getCompetitorsForCollege = (collegeName: string): number => {
    return competitorData.filter(row => 
      row['School Name'] === collegeName
    ).length
  }

  const getSelectedFilterDescription = (): string => {
    if (!selectedFilter || selectedFilter === 'all') return ''
    const firstRow = competitorData.find(row => row.Category === selectedFilter)
    return firstRow?.Description || ''
  }

  const handleRemoveSchool = (schoolName: string) => {
    setRemovedSchools(prev => new Set(prev).add(schoolName))
  }

  const handleRestoreSchool = (schoolName: string) => {
    setRemovedSchools(prev => {
      const newSet = new Set(prev)
      newSet.delete(schoolName)
      return newSet
    })
  }

  const getAvailableSchools = (): string[] => {
    const existingSchools = new Set(competitorData.map(row => row['School Name']).filter(Boolean))
    return Object.keys(competitorLocations).filter(school => 
      !existingSchools.has(school) && !addedSchools.has(school)
    )
  }

  const getFilteredSuggestions = (): string[] => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return getAvailableSchools().filter(school => 
      school.toLowerCase().includes(query)
    ).slice(0, 10)
  }

  const handleAddSchool = (schoolName: string) => {
    setAddedSchools(prev => new Set(prev).add(schoolName))
    setSearchQuery('')
    setShowSuggestions(false)
  }

  return (
    <div className="map-view">
      <div className="map-header">
        <h1>Competitor Markets</h1>
        <p>Select a competitor market to view schools on the map</p>
      </div>
      
      {selectedFilter && selectedFilter !== 'all' && (
        <div className="market-description">
          <div className="market-header">
            <h2>{selectedFilter}</h2>
            <div className="market-stats">
              <span className="stat-item">
                <strong>{filteredColleges.length}</strong> schools
              </span>
            </div>
          </div>
          <div className="market-insight">
            <span className="insight-icon">💡</span>
            <p>{getSelectedFilterDescription()}</p>
          </div>
        </div>
      )}
      
      <div className="map-layout">
        <div className="filter-sidebar">
          <h3>Competitor Markets</h3>
          <div className="filter-options">
            {availableFilters.map((filter) => (
              <label key={filter} className="filter-option">
                <input
                  type="radio"
                  name="competitor-filter"
                  value={filter}
                  checked={selectedFilter === filter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                />
                <span>{filter}</span>
              </label>
            ))}
          </div>
          
          <div className="filter-stats">
            <p><strong>{filteredColleges.length}</strong> schools in this market</p>
          </div>
        </div>
        
        <div className="map-wrapper">
          <div className="map-container">
            <MapContainer 
              center={mapCenter} 
              zoom={6} 
              style={{ height: '600px', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Fit bounds to visible markers */}
              <FitBounds colleges={filteredColleges} baseCollege={baseCollege} />
              
              {/* Base college marker - University of Tulsa */}
              <Marker 
                position={[baseCollege.lat, baseCollege.lng]}
                icon={baseCollegeIcon}
                eventHandlers={{
                  click: () => setSelectedCollege(baseCollege)
                }}
              >
                <Popup>
                  <div className="popup-content">
                    <h3>{baseCollege.name}</h3>
                    <p><strong>Your Institution</strong></p>
                    <p><strong>State:</strong> {baseCollege.state}</p>
                  </div>
                </Popup>
              </Marker>
              
              {/* Competitor markers */}
              {filteredColleges.map((college, index) => (
                <Marker 
                  key={index}
                  position={[college.lat, college.lng]}
                  icon={createColoredIcon(markerColor, college.name)}
                  eventHandlers={{
                    click: () => setSelectedCollege(college)
                  }}
                >
                  <Popup>
                    <div className="popup-content">
                      <h3>{college.name}</h3>
                      <p><strong>State:</strong> {college.state}</p>
                      <button
                        className="popup-remove-btn"
                        onClick={() => handleRemoveSchool(college.name)}
                      >
                        Remove from list
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>

      {(selectedFilter && selectedFilter !== 'all') || removedSchools.size > 0 ? (
        <div className="schools-management-container">
          {selectedFilter && selectedFilter !== 'all' && (
            <div className="add-school-section">
              <h3>Add School to This Market</h3>
              <p className="add-school-info">Search and add additional competitors to the {selectedFilter} market</p>
              <div className="autocomplete-wrapper">
                <input
                  type="text"
                  className="school-search-input"
                  placeholder="Search for schools..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSuggestions(true)
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {showSuggestions && getFilteredSuggestions().length > 0 && (
                  <div className="suggestions-list">
                    {getFilteredSuggestions().map((school) => (
                      <div
                        key={school}
                        className="suggestion-item"
                        onClick={() => handleAddSchool(school)}
                      >
                        <span className="suggestion-name">{school}</span>
                        <span className="suggestion-state">{competitorLocations[school].state}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {removedSchools.size > 0 && (
            <div className="removed-schools-section">
              <h3>Removed Schools</h3>
              <p className="removed-info">Click the restore button to add schools back to the map</p>
              <div className="removed-schools-grid">
                {Array.from(removedSchools).map((schoolName) => (
                  <div key={schoolName} className="removed-school-card">
                    <span className="school-name">{schoolName}</span>
                    <button
                      className="restore-btn"
                      onClick={() => handleRestoreSchool(schoolName)}
                      title="Restore to list"
                    >
                      ⟲
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default MapView