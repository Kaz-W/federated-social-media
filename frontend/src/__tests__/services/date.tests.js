import FormatDate from "../../services/date.service";

describe("Date service", () => {

  it('should format same day time correctly', () => {
    // Arrange.
    const btime = new Date(2021, 4, 12, 13);
    const now = new Date(2021, 4, 12, 14);

    // Act.
    const dateMessage = FormatDate.formatNow(btime, btime, now);

    // Assert.
    expect(dateMessage).toBe("1pm Today");
  });

  it('should format same month correctly', () => {
    // Arrange.
    const btime = new Date(2021, 4, 12, 13);
    const now = new Date(2021, 4, 14, 14);

    // Act.
    const dateMessage = FormatDate.formatNow(btime, btime, now);

    // Assert.
    expect(dateMessage).toBe("1pm 12th May");
  });

  it('should format old correctly', () => {
    // Arrange.
    const btime = new Date(2020, 4, 12, 13);
    const now = new Date(2021, 4, 12, 14);

    // Act.
    const dateMessage = FormatDate.formatNow(btime, btime, now);

    // Assert.
    expect(dateMessage).toBe("12th May 2020");
  });

  it('should format edited time correctly', () => {
    // Arrange.
    const btime = new Date(2021, 4, 12, 13);
    const mtime = new Date(2021, 4, 12, 15);
    const now = new Date(2021, 4, 12, 16);

    // Act.
    const dateMessage = FormatDate.formatNow(btime, mtime, now);

    // Assert.
    expect(dateMessage).toBe("3pm Today (edited)");
  });
});
