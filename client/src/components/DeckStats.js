import DeckStatsTable from "./DeckStatsTable";
import styled from "styled-components";

const DeckStatsWrapper = styled.div`
    padding-top: 4.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: calc(100vh - 8.5rem);

    @media (max-width: 515px) {
        padding-top: 6.5rem;
    }
`;

export default function DeckStats() {
    return (
        <DeckStatsWrapper>
            <DeckStatsTable />
            {/* Will have other things here like most/least missed card, graphs, etc */}
        </DeckStatsWrapper>
    );
}