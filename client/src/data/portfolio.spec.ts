import { describe, expect, it } from 'vitest'
import { contact, projects, skillGroups } from './portfolio'

describe('portfolio data', () => {
  it('uses the canonical GitHub profile', () => {
    expect(contact.github).toBe('https://github.com/toscani-tenekeu')
  })
  it('contains eleven projects with unique numbers and slugs', () => {
    expect(projects).toHaveLength(11)
    expect(new Set(projects.map((project) => project.num)).size).toBe(projects.length)
    expect(new Set(projects.map((project) => project.slug)).size).toBe(projects.length)
  })
  it('does not expose placeholder source links', () => {
    const links = projects.flatMap((project) => project.github ?? [])
    expect(links).not.toContain('#')
    links.forEach((url) => expect(url).toMatch(/^https:\/\/github\.com\//))
  })
  it('includes the requested repositories', () => {
    expect(projects.find((project) => project.title === 'Audio Transcriber')?.github).toBe('https://github.com/toscani-tenekeu/Audio-Transcriber')
    expect(projects.find((project) => project.title === 'wFileManager')?.github).toBe('https://github.com/toscani-tenekeu/wFileManager')
    expect(projects.find((project) => project.title === 'Webcpl')?.github).toBe('https://github.com/toscani-tenekeu/Webcpl')
  })
  it('provides static skills when the API is unavailable', () => {
    expect(skillGroups.length).toBeGreaterThanOrEqual(6)
    skillGroups.forEach((group) => expect(group.skills.length).toBeGreaterThan(0))
  })
})
