package life.swengineer.interviewprep.content;

import life.swengineer.interviewprep.common.NotFoundException;

public enum Difficulty {
    EASY("Easy"),
    MEDIUM("Medium"),
    HARD("Hard");

    private final String label;

    Difficulty(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public static Difficulty fromLabel(String label) {
        for (Difficulty d : values()) {
            if (d.label.equalsIgnoreCase(label)) {
                return d;
            }
        }
        throw new NotFoundException("Unknown difficulty: " + label);
    }
}
