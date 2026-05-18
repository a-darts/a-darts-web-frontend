import { BracketPosition, Participant } from '../services/tournament.service';

/**
  * Builds the standard single-elimination seeding order for a bracket of `size` slots.
  * Example for 8 slots: [1, 8, 5, 4, 3, 6, 7, 2]
  * Guarantees: Seed 1 meets Seed 2 only in the Final, Seed 1 meets Seed 3/4 in the Semis, etc.
  */
export const buildStandardSeedOrder = (size: number): number[] => {
    let result = [1, 2];
    let currentSize = 2;
    while (currentSize < size) {
        currentSize *= 2;
        const next: number[] = [];
        for (let i = 0; i < result.length; i += 2) {
            const s1 = result[i];
            const s2 = result[i + 1];
            next.push(s1, currentSize + 1 - s1, currentSize + 1 - s2, s2);
        }
        result = next;
    }
    return result;
};

/**
 * Shared helper: randomly shuffles `participantsToPlace` and distributes them
 * across bracket positions following the standard seeding order.
 * Clears all slots first, then fills only the given participants.
 * Pure function that returns the new positions array.
 */
export const applyStandardSeeding = (
    totalPositions: number,
    participantsToPlace: Participant[],
    currentPositions: BracketPosition[]
): BracketPosition[] => {
    if (participantsToPlace.length === 0) return currentPositions;

    const seedOrder = buildStandardSeedOrder(totalPositions);

    // Fisher-Yates shuffle
    const shuffled = [...participantsToPlace];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const updated: BracketPosition[] = currentPositions.map((pos) => ({
        ...pos,
        participantId: null,
        participantAlias: null,
        participantFederation: null,
    }));

    shuffled.forEach((participant, seedIndex) => {
        const slotIndex = seedOrder[seedIndex] - 1; // seedOrder is 1-based
        if (slotIndex >= 0 && slotIndex < updated.length) {
            updated[slotIndex] = {
                ...updated[slotIndex],
                participantId: participant.id,
                participantAlias: participant.alias,
                participantFederation: participant.federation,
            };
        }
    });

    return updated;
};