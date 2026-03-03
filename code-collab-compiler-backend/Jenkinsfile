pipeline{
    agent {
        label 'azure-collider-vm'
    }

    stages{
        stage('build'){
            steps{
                dir(''){
                    sh 'mvn clean package'
                }
            }
        }
        stage('deploy'){
            steps{
                dir("target"){
                    sh '''
                        cp code-collab.jar /home/azureuser/
                       '''
                }
            }
        }
    }
}