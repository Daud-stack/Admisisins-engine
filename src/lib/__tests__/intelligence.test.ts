import { describe, it, expect } from 'bun:test'
import { detectDriftPattern } from '../intelligence'

describe('detectDriftPattern', () => {
  it('should return null when arrays are too short', () => {
    expect(detectDriftPattern([1, 2], [1, 2, 3])).toBeNull()
    expect(detectDriftPattern([1, 2, 3], [1, 2])).toBeNull()
    expect(detectDriftPattern([1], [1])).toBeNull()
  })

  it('should return null when there is no significant drift', () => {
    // Both mean shift and cv drift are <= 0.3
    const baseline = [10, 10, 10, 10]
    const current = [11, 10, 11, 10]
    // baseline mean = 10, std = 0, cv = 0
    // current mean = 10.5, std = 0.5, cv = 0.5/10.5 = 0.047
    // meanShift = 0.5/10 = 0.05
    expect(detectDriftPattern(current, baseline)).toBeNull()
  })

  it('should return high severity drift when both mean and CV shift significantly', () => {
    const baseline = [10, 10, 10, 10]
    const current = [20, 10, 30, 20]
    // baseline mean = 10, cv = 0
    // current mean = 20, std = 7.07, cv = 7.07/20 = 0.3535
    // meanShift = 10/10 = 1.0 > 0.3
    // cvDrift = 0.3535 > 0.3
    const insight = detectDriftPattern(current, baseline)
    expect(insight).not.toBeNull()
    expect(insight?.severity).toBe('high')
    expect(insight?.type).toBe('trend')
    expect(insight?.id).toBe('drift-process')
    expect(insight?.title).toBe('Process Drift Detected')
    expect(insight?.description).toContain('Variability pattern has also shifted significantly')
    expect(insight?.value).toBe('100% increase')
  })

  it('should return medium severity drift when only CV shifts significantly', () => {
    const baseline = [10, 10, 10, 10]
    const current = [0, 10, 20, 10]
    // baseline mean = 10, cv = 0
    // current mean = 10, std = 7.07, cv = 7.07/10 = 0.707
    // meanShift = 0 < 0.3
    // cvDrift = 0.707 > 0.3
    const insight = detectDriftPattern(current, baseline)
    expect(insight).not.toBeNull()
    expect(insight?.severity).toBe('medium')
    expect(insight?.description).toContain('Variability pattern has also shifted significantly')
    expect(insight?.value).toBe('0% decrease')
  })

  it('should return medium severity drift when only mean shifts significantly', () => {
    const baseline = [10, 20, 30, 40]
    const current = [20, 40, 60, 80]
    // baseline mean = 25, std = 11.18, cv = 0.447
    // current mean = 50, std = 22.36, cv = 0.447
    // meanShift = 25/25 = 1.0 > 0.3
    // cvDrift = 0 < 0.3
    const insight = detectDriftPattern(current, baseline)
    expect(insight).not.toBeNull()
    expect(insight?.severity).toBe('medium')
    expect(insight?.description).toContain('Consistency is within bounds but volume has shifted')
    expect(insight?.value).toBe('100% increase')
  })

  it('should handle zero mean in baseline array gracefully', () => {
    const baseline = [0, 0, 0, 0]
    const current = [10, 10, 10, 10]
    // baseline mean = 0, cv = 0
    // current mean = 10, cv = 0
    // meanShift = 0 (baselineMean > 0 is false, so meanShift = 0)
    // cvDrift = 0
    // Actually, cvDrift will be 0 - 0 = 0. meanShift will be 0.
    expect(detectDriftPattern(current, baseline)).toBeNull()
  })

  it('should handle zero mean in current array gracefully', () => {
    const baseline = [10, 10, 10, 10]
    const current = [0, 0, 0, 0]
    // baseline mean = 10, cv = 0
    // current mean = 0, cv = 0
    // meanShift = 10/10 = 1.0 > 0.3
    // cvDrift = 0 < 0.3
    const insight = detectDriftPattern(current, baseline)
    expect(insight).not.toBeNull()
    expect(insight?.severity).toBe('medium')
    expect(insight?.value).toBe('100% decrease')
  })
})
