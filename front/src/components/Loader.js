import styled, { keyframes } from "styled-components";

const rotate360 = keyframes`
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
`;

const Loader = styled.div`
  border: 16px solid #f3f3f3; /* Light grey */
  border-top: 16px solid #3273dc; /* Blue */
  border-radius: 50%;
  width: 120px;
  height: 120px;
  margin: auto;
  animation: ${rotate360} 2s linear infinite;
`;

export default Loader;
