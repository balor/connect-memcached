{
  description = "Memcached session store for Connect";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs
            nodePackages.npm
            memcached
          ];

          shellHook = ''
            echo "connect-memcached development environment"
            echo "Node: $(node --version)"
            echo "npm: $(npm --version)"
            echo ""

            # Install dependencies if node_modules doesn't exist
            if [ ! -d "node_modules" ]; then
              echo "Installing npm dependencies..."
              npm install
            fi

            echo "Ready! Run 'npm test' to run tests"
          '';
        };
      }
    );
}
