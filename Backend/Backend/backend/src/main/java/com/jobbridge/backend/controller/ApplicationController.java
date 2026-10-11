package com.jobbridge.backend.controller;

import com.jobbridge.backend.model.JobApplication;
import com.jobbridge.backend.repository.JobApplicationRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    private final JobApplicationRepository applicationRepository;

    public ApplicationController(JobApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    @PostMapping
    public JobApplication applyForJob(@RequestBody JobApplication application) {
        return applicationRepository.save(application);
    }

    @GetMapping
    public List<JobApplication> getAllApplications() {
        return applicationRepository.findAll();
    }
}