import { useEffect, useState } from 'react'
import './Summary.css'

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

interface Competitor {
  name: string;
  rank: string;
  similarityScore: string;
  state: string;
  type: string;
  religion: string;
  acceptanceRate: string;
  nicheGrade: string;
}

interface CompetitorSet {
  description: string;
  competitors: Competitor[];
}

interface GroupedData {
  [setName: string]: CompetitorSet;
}

interface SummaryProps {
  removedSchools: Set<string>;
  addedSchools: Set<string>;
}

function Summary({ removedSchools, addedSchools }: SummaryProps) {
  const [, setCompetitorData] = useState<CompetitorDataRow[]>([])
  const [groupedData, setGroupedData] = useState<GroupedData>({})
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    loadCompetitorData()
  }, [removedSchools, addedSchools])

  const loadCompetitorData = async () => {
    try {
      // Load the CSV data
      const response = await fetch(`${import.meta.env.BASE_URL}university-of-tulsa-data.csv`)
      const csvText = await response.text()
      const data = parseCSV(csvText)
      setCompetitorData(data)
      
      // Group data by category
      const grouped = groupDataByCategory(data)
      setGroupedData(grouped)
    } catch (error) {
      console.error('Error loading competitor data:', error)
    } finally {
      setLoading(false)
    }
  }

  const parseCSV = (csvText: string): CompetitorDataRow[] => {
    const lines = csvText.split('\n').filter((line: string) => line.trim())
    const headers = lines[0].split(',')
    return lines.slice(1).map((line: string) => {
      const values = line.split(',')
      return headers.reduce((obj: CompetitorDataRow, header: string, index: number) => {
        obj[header.trim() as keyof CompetitorDataRow] = values[index] ? values[index].trim() : ''
        return obj
      }, {} as CompetitorDataRow)
    }).filter((row: CompetitorDataRow) => row.Category && row['School Name']) // Filter out empty rows
  }

  const groupDataByCategory = (data: CompetitorDataRow[]): GroupedData => {
    const grouped: GroupedData = {}
    data.forEach((row: CompetitorDataRow) => {
      const category = row.Category
      if (category && category !== 'Category') {
        if (!grouped[category]) {
          grouped[category] = {
            description: row.Description || '',
            competitors: []
          }
        }
        
        // Only add schools that haven't been removed
        if (row['School Name'] && !removedSchools.has(row['School Name'])) {
          grouped[category].competitors.push({
            name: row['School Name'],
            rank: row.Rank || '',
            similarityScore: row['Similarity Score'] || '',
            state: row.State || '',
            type: row.Type || '',
            religion: row.Religion || '',
            acceptanceRate: row['Acceptance Rate'] || '',
            nicheGrade: row['Niche Grade'] || ''
          })
        }
      }
    })
    return grouped
  }

  const getSortedCategories = (): Array<{ category: string; avgSimilarity: number; data: CompetitorSet }> => {
    return Object.entries(groupedData).map(([category, data]) => {
      const avgSimilarity = data.competitors.reduce((sum, comp) => 
        sum + parseFloat(comp.similarityScore), 0) / data.competitors.length
      return { category, avgSimilarity, data }
    }).sort((a, b) => b.avgSimilarity - a.avgSimilarity)
  }

  const getRankColor = (rank: string): string => {
    const rankNum = parseInt(rank)
    if (rankNum <= 3) return 'var(--color-accent-3)' // Top 3 - FB5A00
    if (rankNum <= 5) return 'var(--color-accent-2)' // Top 5 - FF9B00
    if (rankNum <= 7) return 'var(--color-accent-1)' // Top 7 - 835000
    return 'var(--color-accent-5)' // Rest - 8CA6FF
  }

  const getSimilarityLabel = (scoreString: string): string => {
    const score = parseFloat(scoreString)
    if (score > 0.25) return 'Very High'
    if (score >= 0.20) return 'High'
    if (score >= 0.15) return 'Medium'
    return 'Low'
  }

  if (loading) {
    return (
      <div className="summary-container">
        <div className="loading">Loading competitor data...</div>
      </div>
    )
  }

  return (
    <div className="summary-container">
      <div className="summary-header">
        <h1>University of Tulsa - Competitor Analysis</h1>
        <p>Detailed breakdown of competitor markets grouped by strategic themes</p>
      </div>

      <div className="summary-content">
        <div className="stats-overview">
          <div className="stat-card">
            <h3>Total Competitor Markets</h3>
            <span className="stat-number">{Object.keys(groupedData).length}</span>
          </div>
          <div className="stat-card">
            <h3>Total Competitors</h3>
            <span className="stat-number">
              {Object.values(groupedData).reduce((total, set) => total + set.competitors.length, 0)}
            </span>
          </div>
        </div>

        <div className="competitor-sets">
          {getSortedCategories().map(({ category, data }, index) => (
            <div key={category} className="competitor-set">
              <div className="set-header">
                <div className="header-content">
                  <div className="priority-label">Priority {index + 1}</div>
                  <h3>{category}</h3>
                </div>
              </div>
              
              {data.description && (
                <div className="description-text">
                  <span className="insight-icon">💡</span>
                  {data.description}
                </div>
              )}
              
              <div className="competitors-table-wrapper">
                <table className="competitors-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>School Name</th>
                      <th>State</th>
                      <th>Type</th>
                      <th>Religion</th>
                      <th>Similarity</th>
                      <th>Acceptance Rate</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.competitors.map((competitor: Competitor, idx: number) => (
                      <tr key={idx}>
                        <td>
                          <div 
                            className="rank-badge"
                            style={{ backgroundColor: getRankColor(competitor.rank) }}
                          >
                            {competitor.rank}
                          </div>
                        </td>
                        <td className="school-name-cell">{competitor.name}</td>
                        <td>{competitor.state}</td>
                        <td>{competitor.type}</td>
                        <td>{competitor.religion || '—'}</td>
                        <td>{getSimilarityLabel(competitor.similarityScore)}</td>
                        <td>{(parseFloat(competitor.acceptanceRate) * 100).toFixed(0)}%</td>
                        <td className="grade-cell">{competitor.nicheGrade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Summary