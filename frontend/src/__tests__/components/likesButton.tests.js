import React from "react";
import {render, cleanup, fireEvent, wait} from "@testing-library/react";
import LikeButton from "../../components/likesButton/LikeButton.component";
import api from "../../utils/api";

jest.mock('../../utils/api');

afterEach(cleanup);


describe("voting button tests", () => {

  describe("displays correct voting numbers", () => {

    it("displays 0 when both are 0", () => {
      const mockVotable = {
        _userVotes: [],
        upvotes: 0,
        downvotes: 0
      }

      const { getByText } = render(<LikeButton userUrl={"Beep"} votable={mockVotable} />);

      expect(getByText(/0/i).textContent).toBe("0");
    });

    it("displays 0 when both are undefined", () => {
      const mockVotable = {
        _userVotes: [],
      }

      const { getByText } = render(<LikeButton userUrl={"Beep"} votable={mockVotable} />);

      expect(getByText(/0/i).textContent).toBe("0");
    });

    it("calculates positive votes correctly", () => {
      const mockVotable = {
        _userVotes: [],
        upvotes: 10,
        downvotes: 2
      }

      const { getByText } = render(<LikeButton userUrl={"Beep"} votable={mockVotable} />);

      expect(getByText(/8/i).textContent).toBe("8");
    });

    it("calculates negative votes correctly", () => {
      const mockVotable = {
        _userVotes: [],
        upvotes: 2,
        downvotes: 10
      }

      const { getByText } = render(<LikeButton userUrl={"Beep"} votable={mockVotable} />);

      expect(getByText(/-8/i).textContent).toBe("-8");
    });
  });

  describe("Casts votes correctly", () => {

    it("increases votes by one on upvote", async () => {
      // Arrange.
      const mockVotable = {
        _userVotes: [],
        upvotes: 0,
        downvotes: 0
      };

      api.relay.put.mockResolvedValue({ ok: true });

      const { getByRole, getByText } = render(<LikeButton userUrl={"Beep"} votable={mockVotable} />);

      // Act.
      fireEvent.click(getByRole('button', {name: 'upvote'}));

      // Assert.
      await wait(() => {
        expect(getByText(/1/i).textContent).toBe("1");
      });
    });

    it("decreases votes by one on downvote", async () => {
      // Arrange.
      const mockVotable = {
        _userVotes: [],
        upvotes: 0,
        downvotes: 0
      };

      api.relay.put.mockResolvedValue({ ok: true });

      const { getByRole, getByText } = render(<LikeButton userUrl={"Beep"} votable={mockVotable} />);

      // Act.
      fireEvent.click(getByRole('button', {name: 'downvote'}));

      // Assert.
      await wait(() => {
        expect(getByText(/-1/i).textContent).toBe("-1");
      });
    });

    it("increases votes by two on downvote to upvote", async () => {
      // Arrange.
      const mockVotable = {
        _userVotes: [
          { user: "userUrl", isUpvote: false }
        ],
        upvotes: 0,
        downvotes: 1
      };

      api.relay.put.mockResolvedValue({ ok: true });

      const { getByRole, getByText } = render(<LikeButton userUrl="userUrl" votable={mockVotable} />);

      // Act.
      fireEvent.click(getByRole('button', {name: 'upvote'}));

      // Assert.
      await wait(() => {
        expect(getByText(/1/i).textContent).toBe("1");
      });
    });

    it("decreases votes by two on upvote to downvote", async () => {
      // Arrange.
      const mockVotable = {
        _userVotes: [
          { user: "userUrl", isUpvote: true }
        ],
        upvotes: 1,
        downvotes: 0
      };

      api.relay.put.mockResolvedValue({ ok: true });

      const { getByRole, getByText } = render(<LikeButton userUrl="userUrl" votable={mockVotable} />);

      // Act.
      fireEvent.click(getByRole('button', {name: 'downvote'}));

      // Assert.
      await wait(() => {
        expect(getByText(/-1/i).textContent).toBe("-1");
      });
    });
  });

  describe("unvotes correctly", () => {

    it("removes an upvote when already selected", async () => {
      // Arrange.
      const mockVotable = {
        _userVotes: [ { user: "userUrl", isUpvote: true } ],
        upvotes: 1,
        downvotes: 0
      };

      api.relay.put.mockResolvedValue({ ok: true });

      const { getByRole, getByText } = render(<LikeButton userUrl="userUrl" votable={mockVotable} />);

      // Act.
      fireEvent.click(getByRole('button', {name: 'upvote'}));

      // Assert.
      await wait(() => {
        expect(getByText(/0/i).textContent).toBe("0");
      });
    });

    it("removes a downvote when already selected", async () => {
      // Arrange.
      const mockVotable = {
        _userVotes: [ { user: "userUrl", isUpvote: false } ],
        upvotes: 0,
        downvotes: 1
      };

      api.relay.put.mockResolvedValue({ ok: true });

      const { getByRole, getByText } = render(<LikeButton userUrl="userUrl" votable={mockVotable} />);

      // Act.
      fireEvent.click(getByRole('button', {name: 'downvote'}));

      // Assert.
      await wait(() => {
        expect(getByText(/0/i).textContent).toBe("0");
      });
    });
  });
});





