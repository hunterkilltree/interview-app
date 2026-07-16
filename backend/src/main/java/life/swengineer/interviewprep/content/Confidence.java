package life.swengineer.interviewprep.content;

import life.swengineer.interviewprep.common.NotFoundException;

public enum Confidence {
    LOW("Low"),
    MEDIUM("Medium"),
    HIGH("High");

    private final String label;

    Confidence(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public static Confidence fromLabel(String label) {
        for (Confidence c : values()) {
            if (c.label.equalsIgnoreCase(label)) {
                return c;
            }
        }
        throw new NotFoundException("Unknown confidence: " + label);
    }
}
