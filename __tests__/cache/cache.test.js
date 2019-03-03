import Cache from '../../src/cache/cache';

describe('The `Cache` class', () => {
  it('append method', () => {
    const sut = new Cache();
    const expectedAppendList = [0x45, 0x44, 0x46];
    sut.append(Buffer.from(expectedAppendList));
    expect(sut.getReadOnlyBuffer()).toMatchObject(expectedAppendList);
  });
    
  it('append method (alt)', () => {
    const sut = new Cache();
    const expectedAppendList = [0x75, 0x64, 0x26];
    sut.append(Buffer.from(expectedAppendList));
    expect(sut.getReadOnlyBuffer()).toMatchObject(expectedAppendList);
  });
    
    it('put method', () => {
        const sut = new Cache();
        const expectedAppendList = [0x75, 0x64, 0x26, 0x44, 0x83, 0xFF];
        sut.append(Buffer.from(expectedAppendList));
        
        sut.getReadOnlyBuffer();
        sut.put(Buffer.from([0x26]), 3);

        expect(sut.read(Buffer.from([0x26]))).toMatchObject({
            value: Buffer.from([0x26]),
            offset: 2,
            length: 1
        })
    });
});