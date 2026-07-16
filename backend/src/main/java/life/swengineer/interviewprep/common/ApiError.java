package life.swengineer.interviewprep.common;

import java.util.List;

public record ApiError(String code, String message, List<String> details) {}
