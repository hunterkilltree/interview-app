package life.swengineer.interviewprep.content;

import java.util.UUID;
import life.swengineer.interviewprep.common.ApiResponse;
import life.swengineer.interviewprep.content.dto.ContentDtos.DocResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/docs")
@RequiredArgsConstructor
class DocController {

    private final ContentService contentService;

    @GetMapping
    ApiResponse<Page<DocResponse>> list(
            @RequestParam(required = false) String section,
            Pageable pageable) {
        return ApiResponse.ok(contentService.findDocs(section, pageable).map(DocResponse::from));
    }

    @GetMapping("/{id}")
    ApiResponse<DocResponse> get(@PathVariable UUID id) {
        return ApiResponse.ok(DocResponse.from(contentService.findDoc(id)));
    }
}
