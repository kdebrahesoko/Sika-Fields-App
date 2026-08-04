pipeline {
    agent {
        label "docker3"
    }

    environment {
        DOCKERHUB_CRED   = credentials('DOCKERHUB_CRED')
        REG_AML_CRED     = credentials('REG_AML_CRED')
        USER_CREDENTIALS = credentials('dev-swarm-manager-user-password')
        SERVICE          = "sikafields-landing-page"
        STACK            = "sikafields"
        registry_URL     = "reg-aml.esoko.com"
        imageName        = "esoko/sikafields-landing-page"
        IMAGE            = "reg-aml.esoko.com/develop.esoko/sikafields-landing-page"
        TAG              = "alpha"
        imageTag         = "${env.BUILD_ID}"
        GITOPS_APP_PATH     = "apps/sikafield-landing-page/base/deployment.yaml"
        GITOPS_DEV_APP_PATH = "apps/sikafield-landing-page/overlays/dev/patch-deployment.yaml"
    }

    triggers {
        githubPush()
    }

    stages {

        stage('Init Environment') {
            steps {
                script {
                    env.TAG_NAME = sh(script: "git tag --points-at=HEAD || echo 'none'", returnStdout: true).trim()
                    echo "TAG_NAME = ${env.TAG_NAME}"
                }
            }
        }

        stage("Trivy Repo Scan") {
            steps {
                script {
                    echo "Running Trivy File System Scan (pre-build)..."
                    sh """
                        mkdir -p trivy-reports

                        docker run --rm \
                          -v \$(pwd):/src \
                          -v \$(pwd)/trivy-reports:/reports \
                          reg-aml.esoko.com/develop.esoko/trivy:0.69.3 fs /src \
                          --exit-code 0 \
                          --severity UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL \
                          --format json \
                          --output /reports/trivy-fs-report.json

                        docker run --rm \
                          -v \$(pwd)/trivy-reports:/reports \
                          reg-aml.esoko.com/develop.esoko/trivy:0.69.3 convert \
                          --format template --template "@/contrib/html.tpl" \
                          --output /reports/trivy-fs-report.html \
                          /reports/trivy-fs-report.json
                    """
                }
            }
            post {
                always {
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'trivy-reports',
                        reportFiles: 'trivy-fs-report.html',
                        reportName: 'Trivy Repo (FS) Scan'
                    ])
                    archiveArtifacts artifacts: 'trivy-reports/trivy-fs-report.*', fingerprint: true
                }
            }
        }

        stage("Build DockerFile and Tag to Dev") {
            when {
                anyOf { branch 'develop'; branch 'Sprint*'; branch 'Hotfix*'; branch 'sprint*'; branch 'feature/*'; branch 'cicd-feature/*' }
            }
            steps {
                script {
                    env.SHORT_SHA = sh(script: 'echo $GIT_COMMIT | cut -c1-7', returnStdout: true).trim()
                }
                sh "docker login --username ${DOCKERHUB_CRED_USR} --password '${DOCKERHUB_CRED_PSW}'"
                sh "docker build -t ${env.imageName}:${env.SHORT_SHA} ."
                sh "docker push ${env.imageName}:${env.SHORT_SHA}"
                sh "docker image prune -f"
                sh "docker builder prune -f"
            }
        }

        stage("Trivy Image Scan Dev") {
            when {
                anyOf { branch 'develop'; branch 'Sprint*'; branch 'Hotfix*'; branch 'sprint*'; branch 'feature/*'; branch 'cicd-feature/*' }
            }
            steps {
                script {
                    echo "Running Trivy Image Scan (post-build)..."
                    try {
                        sh """
                            mkdir -p trivy-reports

                            docker run --rm \
                              -v /var/run/docker.sock:/var/run/docker.sock \
                              -v \$(pwd)/trivy-reports:/reports \
                              reg-aml.esoko.com/develop.esoko/trivy:0.69.3 image \
                              --exit-code 0 \
                              --severity UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL \
                              --format json \
                              --output /reports/trivy-image-report.json \
                              ${env.imageName}:${env.SHORT_SHA}

                            docker run --rm \
                              -v \$(pwd)/trivy-reports:/reports \
                              reg-aml.esoko.com/develop.esoko/trivy:0.69.3 convert \
                              --format template --template "@/contrib/html.tpl" \
                              --output /reports/trivy-image-report.html \
                              /reports/trivy-image-report.json
                        """
                    } catch (Exception e) {
                        echo "WARNING: Trivy image scan failed (non-fatal): ${e.message}"
                    }
                }
            }
            post {
                always {
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'trivy-reports',
                        reportFiles: 'trivy-image-report.html',
                        reportName: 'Trivy Image Scan'
                    ])
                    archiveArtifacts artifacts: 'trivy-reports/trivy-image-report.*', fingerprint: true

                    script {
                        def criticalCount = 0
                        def highCount = 0
                        def mediumCount = 0

                        try {
                            criticalCount = sh(
                                script: '''jq '[.Results[] | select(.Vulnerabilities != null) | .Vulnerabilities[] | select(.Severity=="CRITICAL")] | length' trivy-reports/trivy-image-report.json 2>/dev/null || echo 0''',
                                returnStdout: true
                            ).trim().toInteger()
                            highCount = sh(
                                script: '''jq '[.Results[] | select(.Vulnerabilities != null) | .Vulnerabilities[] | select(.Severity=="HIGH")] | length' trivy-reports/trivy-image-report.json 2>/dev/null || echo 0''',
                                returnStdout: true
                            ).trim().toInteger()
                            mediumCount = sh(
                                script: '''jq '[.Results[] | select(.Vulnerabilities != null) | .Vulnerabilities[] | select(.Severity=="MEDIUM")] | length' trivy-reports/trivy-image-report.json 2>/dev/null || echo 0''',
                                returnStdout: true
                            ).trim().toInteger()
                        } catch (Exception e) {
                            echo "Warning: Could not count vulnerabilities: ${e.message}"
                        }

                        branchName = env.GIT_BRANCH ?: sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
                        def vulnerabilityStatus = (criticalCount > 0) ? '*CRITICAL VULNERABILITIES FOUND*' :
                                                   (highCount > 0)     ? 'High severity vulnerabilities found' :
                                                   (mediumCount > 0)   ? 'Medium severity vulnerabilities found' :
                                                                          'No critical, high, or medium vulnerabilities'
                        def color = (criticalCount > 0) ? '#FF0000' :
                                    (highCount > 0)     ? '#FFA500' :
                                    (mediumCount > 0)   ? '#FFD700' : '#36a64f'

                        slackSend(
                            color: color,
                            message: """
                            *Security Scan Completed for* `${env.SERVICE} - ${branchName}`
                            ${vulnerabilityStatus}

                            *CRITICAL:* ${criticalCount}
                            *HIGH:* ${highCount}
                            *MEDIUM:* ${mediumCount}

                            📊 [View HTML Report](${env.BUILD_URL}Trivy_Image_Scan/)
                            """.stripIndent(),
                            channel: '#devops-notify'
                        )
                    }
                }
            }
        }

        stage("Update Dev GitOps Manifest") {
            when {
                anyOf { branch 'develop'; branch 'Sprint*'; branch 'Hotfix*'; branch 'sprint*'; branch 'feature/*'; branch 'cicd-feature/*' }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'github-cred', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
                    sh """
                        rm -rf gitops-dev-repo
                        git clone https://${GIT_USER}:${GIT_TOKEN}@github.com/esoko-ghana/sikafields-gitops.git gitops-dev-repo
                        cd gitops-dev-repo
                        sed -i 's|${env.imageName}:.*|${env.imageName}:${env.SHORT_SHA}|g' ${env.GITOPS_DEV_APP_PATH}
                        git config user.email "jenkins@sikafields.net"
                        git config user.name "Jenkins"
                        git add ${env.GITOPS_DEV_APP_PATH}
                        git diff --cached --quiet || (git commit -m "Deploy ${SERVICE}:${env.SHORT_SHA} to sikafields dev" && git push https://${GIT_USER}:${GIT_TOKEN}@github.com/esoko-ghana/sikafields-gitops.git main)
                    """
                }
            }
            post {
                success {
                    slackSend(color: '#36a64f', message: """
                        *GitOps Updated — FluxCD deploying to dev* 🚀
                        *Service:* `${SERVICE}`
                        *Image:* `${env.IMAGE}:${env.SHORT_SHA}`
                        *Cluster:* sikafields-dev
                        """.stripIndent(), channel: '#devops-notify')
                }
                failure {
                    slackSend(color: '#FF0000', message: """
                        *Dev GitOps Update FAILED* ❌
                        *Service:* `${SERVICE}:${env.SHORT_SHA}`
                        🔍 [View Logs](${env.BUILD_URL})
                        """.stripIndent(), channel: '#devops-notify')
                }
            }
        }

        stage("Build - prod") {
            when { tag "v*" }
            steps {
                sh "docker build -f Dockerfile.prod -t ${env.imageName}:${env.TAG_NAME} ."
            }
        }

        stage("Trivy Image Scan - PROD") {
            when { tag "v*" }
            steps {
                script {
                    echo "Running Trivy Image Scan for PROD image..."
                    sh """
                        mkdir -p trivy-reports

                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          -v \$(pwd)/trivy-reports:/reports \
                          reg-aml.esoko.com/develop.esoko/trivy:0.69.3 image \
                          --exit-code 0 \
                          --severity UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL \
                          --format json \
                          --output /reports/trivy-prod-image-report.json \
                          ${env.imageName}:${env.TAG_NAME}

                        docker run --rm \
                          -v \$(pwd)/trivy-reports:/reports \
                          reg-aml.esoko.com/develop.esoko/trivy:0.69.3 convert \
                          --format template --template "@/contrib/html.tpl" \
                          --output /reports/trivy-prod-image-report.html \
                          /reports/trivy-prod-image-report.json
                    """
                }
            }
            post {
                always {
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'trivy-reports',
                        reportFiles: 'trivy-prod-image-report.html',
                        reportName: 'Trivy PROD Image Scan'
                    ])
                    archiveArtifacts artifacts: 'trivy-reports/trivy-prod-image-report.*', fingerprint: true

                    script {
                        def criticalCount = 0
                        def highCount = 0
                        def mediumCount = 0

                        try {
                            criticalCount = sh(
                                script: '''jq '[.Results[] | select(.Vulnerabilities != null) | .Vulnerabilities[] | select(.Severity=="CRITICAL")] | length' trivy-reports/trivy-prod-image-report.json 2>/dev/null || echo 0''',
                                returnStdout: true
                            ).trim().toInteger()
                            highCount = sh(
                                script: '''jq '[.Results[] | select(.Vulnerabilities != null) | .Vulnerabilities[] | select(.Severity=="HIGH")] | length' trivy-reports/trivy-prod-image-report.json 2>/dev/null || echo 0''',
                                returnStdout: true
                            ).trim().toInteger()
                            mediumCount = sh(
                                script: '''jq '[.Results[] | select(.Vulnerabilities != null) | .Vulnerabilities[] | select(.Severity=="MEDIUM")] | length' trivy-reports/trivy-prod-image-report.json 2>/dev/null || echo 0''',
                                returnStdout: true
                            ).trim().toInteger()
                        } catch (Exception e) {
                            echo "Warning: Could not count vulnerabilities: ${e.message}"
                        }

                        def vulnerabilityStatus = (criticalCount > 0) ? '*CRITICAL VULNERABILITIES FOUND*' :
                                                   (highCount > 0)     ? 'High severity vulnerabilities found' :
                                                   (mediumCount > 0)   ? 'Medium severity vulnerabilities found' :
                                                                          'No critical, high, or medium vulnerabilities'
                        def color = (criticalCount > 0) ? '#FF0000' :
                                    (highCount > 0)     ? '#FFA500' :
                                    (mediumCount > 0)   ? '#FFD700' : '#36a64f'

                        slackSend(
                            color: color,
                            message: """
                            *Security Scan Completed for PROD Image* `${SERVICE}:${env.TAG_NAME}`
                            ${vulnerabilityStatus}

                            *CRITICAL:* ${criticalCount}
                            *HIGH:* ${highCount}
                            *MEDIUM:* ${mediumCount}

                            📊 [View HTML Report](${env.BUILD_URL}Trivy_PROD_Image_Scan/)
                            """.stripIndent(),
                            channel: '#devops-notify'
                        )
                    }
                }
            }
        }

        stage("release") {
            when { tag "v*" }
            steps {
                sh "docker login --username ${DOCKERHUB_CRED_USR} --password '${DOCKERHUB_CRED_PSW}'"
                sh "docker push ${env.imageName}:${env.TAG_NAME}"
                sh "docker image prune -f"
            }
        }

        stage("Update GitOps Manifest") {
            when { tag "v*" }
            steps {
                withCredentials([usernamePassword(credentialsId: 'github-cred', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
                    sh """
                        git clone https://${GIT_USER}:${GIT_TOKEN}@github.com/esoko-ghana/sikafields-gitops.git gitops-repo

                        cd gitops-repo

                        sed -i 's|${env.imageName}:.*|${env.imageName}:${env.TAG_NAME}|g' ${env.GITOPS_APP_PATH}

                        git config user.email "jenkins@sikafields.net"
                        git config user.name "Jenkins"
                        git add ${env.GITOPS_APP_PATH}
                        git commit -m "Deploy ${SERVICE}:${env.TAG_NAME} to sikafields EKS"
                        git push https://${GIT_USER}:${GIT_TOKEN}@github.com/esoko-ghana/sikafields-gitops.git main
                    """
                }
            }
            post {
                success {
                    slackSend(color: '#36a64f', message: """
                        *GitOps Updated — FluxCD deploying to EKS* 🚀
                        *Service:* `${SERVICE}`
                        *Image:* `${env.imageName}:${env.TAG_NAME}`
                        *Cluster:* sikafields (eu-west-2)
                        """.stripIndent(), channel: '#devops-notify')
                }
                failure {
                    slackSend(color: '#FF0000', message: """
                        *GitOps Update FAILED* ❌
                        *Service:* `${SERVICE}:${env.TAG_NAME}`
                        🔍 [View Logs](${env.BUILD_URL})
                        """.stripIndent(), channel: '#devops-notify')
                }
            }
        }
    }

    post {
        success {
            script {
                slackSend(
                    color: '#00FF00',
                    message: "Build succeeded: ${currentBuild.fullDisplayName}",
                    channel: '#devops-notify'
                )
            }
        }
        failure {
            script {
                slackSend(
                    color: '#FF0000',
                    message: "Build FAILED: ${currentBuild.fullDisplayName}\nLogs: ${env.BUILD_URL}",
                    channel: '#devops-notify'
                )
            }
        }
        always {
            cleanWs(
                cleanWhenNotBuilt: false,
                deleteDirs: true,
                disableDeferredWipeout: true,
                notFailBuild: true
            )
        }
    }
}
