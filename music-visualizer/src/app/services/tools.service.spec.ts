import { TestBed } from '@angular/core/testing';

import { ToolsService } from './tools.service';

describe('ToolsService', () => {
  let service: ToolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToolsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('test fractionate()', () => {
    expect(service.fractionate(2, 1, 3)).toBe(0.5);
  });

  it('test modulate()', () => {
    expect(service.modulate(2, 1, 3, 4, 10)).toBe(7);
  });

  it('test avg()', () => {
    expect(service.avg([1, 2, 3, 4, 5])).toBe(3);
  });

  it('test max()', () => {
    expect(service.max([1, 2, 3, 4, 5])).toBe(5);
  });

  it('test getIndicesOfMax(): empty array', () => {
    let testArray = [];
    expect(service.getIndicesOfMax(testArray, 0)).toEqual([]);
  });

  it('test getIndicesOfMax(): array with one element', () => {
    let testArray = [1];
    expect(service.getIndicesOfMax(testArray, 1)).toEqual([0]);
  });

  it('test getIndicesOfMax(): many element array', () => {
    let testArray = [1, 5, 7];
    expect(service.getIndicesOfMax(testArray, 2)).toEqual([1, 0]);
  });
});
