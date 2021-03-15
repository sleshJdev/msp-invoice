# -*- mode: ruby -*-
# vi: set ft=ruby :

$script = <<-SCRIPT
swapoff -a
sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key --keyring /etc/apt/trusted.gpg.d/docker.gpg add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
add-apt-repository "deb [arch=amd64] https://apt.kubernetes.io/ kubernetes-xenial main"
apt-get install -y apt-transport-https ca-certificates curl software-properties-common gnupg2 nginx docker.io kubelet kubeadm kubectl
apt-mark hold kubelet kubeadm kubectl
cat <<EOF | tee /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF
sudo groupadd -f docker
sudo usermod -aG docker vagrant
newgrp docker
IPADDR=`ip -4 address show dev eth1 | grep inet | awk '{print $2}' | cut -f1 -d/`
NODENAME=$(hostname -s)
kubeadm init --pod-network-cidr=10.244.0.0/16 --apiserver-cert-extra-sans=${IPADDR}  --node-name=${NODENAME}
sudo --user=vagrant mkdir -p /home/vagrant/.kube
sudo cp -i /etc/kubernetes/admin.conf /home/vagrant/.kube/config
sudo chown $(id -u vagrant):$(id -g vagrant) /home/vagrant/.kube/config
sleep 10s
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
sleep 5s
kubectl taint nodes --all node-role.kubernetes.io/master- 
SCRIPT

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|
  config.vm.boot_timeout = 300

  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://vagrantcloud.com/search.
  config.vm.box = "bento/ubuntu-20.04"

  # Disable automatic box update checking. If you disable this, then
  # boxes will only be checked for updates when the user runs
  # `vagrant box outdated`. This is not recommended.
  config.vm.box_check_update = false

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  # NOTE: This will enable public access to the opened port
  # config.vm.network "forwarded_port", guest: 80, host: 8080

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine and only allow access
  # via 127.0.0.1 to disable public access
  config.vm.network "forwarded_port", guest: 80, host: 9999, host_ip: "127.0.0.1"
  config.vm.network "forwarded_port", guest: 6443, host: 6443, host_ip: "127.0.0.1"
  config.vm.network "forwarded_port", guest: 8001, host: 8001, host_ip: "127.0.0.1"
  config.vm.network "forwarded_port", guest: 30001, host: 30001, host_ip: "127.0.0.1"
  config.vm.network "forwarded_port", guest: 30002, host: 30002, host_ip: "127.0.0.1"
  config.vm.network "forwarded_port", guest: 30003, host: 30003, host_ip: "127.0.0.1"
  config.vm.network "forwarded_port", guest: 30004, host: 30004, host_ip: "127.0.0.1"
  config.vm.network "forwarded_port", guest: 30005, host: 30005, host_ip: "127.0.0.1"
  config.vm.network "forwarded_port", guest: 30006, host: 30006, host_ip: "127.0.0.1"
  config.vm.network "forwarded_port", guest: 30007, host: 30007, host_ip: "127.0.0.1"
  config.vm.network "forwarded_port", guest: 30008, host: 30008, host_ip: "127.0.0.1"
  config.vm.network "forwarded_port", guest: 30009, host: 30009, host_ip: "127.0.0.1"

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  # config.vm.network "private_network", ip: "192.168.33.10"
  config.vm.network "private_network", type: "dhcp"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  # config.vm.network "public_network"

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../data", "/vagrant_data"

  # Provider-specific configuration so you can fine-tune various
  # backing providers for Vagrant. These expose provider-specific options.
  # Example for VirtualBox:
  
  config.vm.provider "virtualbox" do |vb|
    # Display the VirtualBox GUI when booting the machine
    # vb.gui = true
  
    # Customize the amount of memory on the VM:
    vb.memory = "3072"
    vb.cpus = 3
  end
  #
  # View the documentation for the provider you are using for more
  # information on available options.

  # Enable provisioning with a shell script. Additional provisioners such as
  # Ansible, Chef, Docker, Puppet and Salt are also available. Please see the
  # documentation for more information about their specific syntax and use.
  config.vm.provision "shell", inline: $script

  config.vagrant.plugins = ["vagrant-scp"]
end
